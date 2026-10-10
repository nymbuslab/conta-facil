#!/usr/bin/env bash

set -euo pipefail

PROJECT_ID="${NEON_PROJECT_ID:-falling-tree-35553185}"
PROJECT_NAME="conta-facil"
PARENT_BRANCH="${NEON_TEST_PARENT_BRANCH:-production}"
TEST_BRANCH="${NEON_TEST_BRANCH:-test}"

if [[ "$TEST_BRANCH" != "test" && ! "$TEST_BRANCH" =~ ^test-[A-Za-z0-9_-]+$ ]]; then
  echo "Recusando resetar: NEON_TEST_BRANCH ('$TEST_BRANCH') precisa ser exatamente 'test' ou comecar com 'test-' (nunca 'production', 'main' ou qualquer outra branch real)." >&2
  exit 1
fi

projects_json="$(neon projects list --output json)"
PROJECTS_JSON="$projects_json" PROJECT_ID="$PROJECT_ID" PROJECT_NAME="$PROJECT_NAME" node --input-type=module -e '
  const projects = JSON.parse(process.env.PROJECTS_JSON)
  const project = projects.find(({ id }) => id === process.env.PROJECT_ID)
  if (!project || project.name !== process.env.PROJECT_NAME) {
    throw new Error(`Projeto Neon inesperado: esperado ${process.env.PROJECT_NAME} (${process.env.PROJECT_ID})`)
  }
'

branches_json="$(neon branches list --project-id "$PROJECT_ID" --output json)"
branch_exists="$(BRANCHES_JSON="$branches_json" TEST_BRANCH="$TEST_BRANCH" node --input-type=module -e '
  const branches = JSON.parse(process.env.BRANCHES_JSON)
  process.stdout.write(String(branches.some(({ name }) => name === process.env.TEST_BRANCH)))
')"

if [[ "$branch_exists" != "true" ]]; then
  neon branches create \
    --project-id "$PROJECT_ID" \
    --name "$TEST_BRANCH" \
    --parent "$PARENT_BRANCH" \
    --no-secrets
  branches_json="$(neon branches list --project-id "$PROJECT_ID" --output json)"
fi

# Validar ANTES do reset destrutivo: a branch alvo precisa já existir, pertencer
# de fato a PARENT_BRANCH e nunca ser a própria branch principal.
BRANCHES_JSON="$branches_json" TEST_BRANCH="$TEST_BRANCH" PARENT_BRANCH="$PARENT_BRANCH" node --input-type=module -e '
  const branches = JSON.parse(process.env.BRANCHES_JSON)
  const testBranch = branches.find(({ name }) => name === process.env.TEST_BRANCH)
  const parentBranch = branches.find(({ name }) => name === process.env.PARENT_BRANCH)
  if (!testBranch || !parentBranch || testBranch.id === parentBranch.id || testBranch.parent_id !== parentBranch.id) {
    throw new Error(`Branch ${process.env.TEST_BRANCH} nao existe ou nao e filha de ${process.env.PARENT_BRANCH} - abortando antes do reset destrutivo`)
  }
'

neon branches reset "$TEST_BRANCH" --parent --project-id "$PROJECT_ID"

branches_json="$(neon branches list --project-id "$PROJECT_ID" --output json)"
BRANCHES_JSON="$branches_json" TEST_BRANCH="$TEST_BRANCH" PARENT_BRANCH="$PARENT_BRANCH" node --input-type=module -e '
  const branches = JSON.parse(process.env.BRANCHES_JSON)
  const testBranch = branches.find(({ name }) => name === process.env.TEST_BRANCH)
  const parentBranch = branches.find(({ name }) => name === process.env.PARENT_BRANCH)
  if (!testBranch || !parentBranch || testBranch.parent_id !== parentBranch.id || testBranch.current_state !== "ready") {
    throw new Error(`Branch ${process.env.TEST_BRANCH} nao esta pronta ou nao pertence a ${process.env.PARENT_BRANCH}`)
  }
'

echo "Branch $TEST_BRANCH resetada a partir de $PARENT_BRANCH no projeto $PROJECT_NAME."

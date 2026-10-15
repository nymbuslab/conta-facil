CREATE TYPE "public"."origem_movimentacao_caixinha" AS ENUM('saldo_atual', 'de_fora');--> statement-breakpoint
CREATE TYPE "public"."tipo_movimentacao_caixinha" AS ENUM('deposito', 'resgate');--> statement-breakpoint
CREATE TABLE "caixinha_movimentacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"caixinha_id" uuid NOT NULL,
	"tipo" "tipo_movimentacao_caixinha" NOT NULL,
	"origem" "origem_movimentacao_caixinha",
	"valor" integer NOT NULL,
	"lancamento_id" uuid,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "caixinha_movimentacoes_valor_positivo" CHECK ("caixinha_movimentacoes"."valor" > 0),
	CONSTRAINT "caixinha_movimentacoes_origem_por_tipo" CHECK (("caixinha_movimentacoes"."tipo" = 'deposito' AND "caixinha_movimentacoes"."origem" IS NOT NULL) OR ("caixinha_movimentacoes"."tipo" = 'resgate' AND "caixinha_movimentacoes"."origem" IS NULL)),
	CONSTRAINT "caixinha_movimentacoes_lancamento_so_de_fora" CHECK ("caixinha_movimentacoes"."lancamento_id" IS NULL OR "caixinha_movimentacoes"."origem" = 'de_fora')
);
--> statement-breakpoint
CREATE INDEX "caixinha_movimentacoes_caixinha_id_idx" ON "caixinha_movimentacoes" USING btree ("caixinha_id","criado_em");--> statement-breakpoint
CREATE INDEX "caixinha_movimentacoes_user_id_idx" ON "caixinha_movimentacoes" USING btree ("user_id");
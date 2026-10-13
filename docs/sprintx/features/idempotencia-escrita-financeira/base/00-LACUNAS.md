# Lacunas

- O contrato atual não define se toda escrita protegida deve exigir `Idempotency-Key` ou se o cabeçalho será opcional durante compatibilidade.
- O projeto não define prazo de retenção para registros de idempotência.
- O cliente HTTP não define quais falhas de rede ou status transitórios podem ser repetidos automaticamente.

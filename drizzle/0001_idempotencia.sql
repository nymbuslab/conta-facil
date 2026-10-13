CREATE TABLE "idempotencias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"chave" uuid NOT NULL,
	"operacao" text NOT NULL,
	"hash_requisicao" text NOT NULL,
	"status_resposta" integer NOT NULL,
	"corpo_resposta" jsonb NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "idempotencias_user_id_chave_unique" UNIQUE("user_id","chave")
);

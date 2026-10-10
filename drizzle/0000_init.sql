CREATE TYPE "public"."tipo_lancamento" AS ENUM('receita', 'despesa');--> statement-breakpoint
CREATE TABLE "caixinhas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"valor_guardado" integer DEFAULT 0 NOT NULL,
	"meta" integer NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "caixinhas_valor_guardado_nao_negativo" CHECK ("caixinhas"."valor_guardado" >= 0),
	CONSTRAINT "caixinhas_meta_positiva" CHECK ("caixinhas"."meta" > 0)
);
--> statement-breakpoint
CREATE TABLE "lancamentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tipo" "tipo_lancamento" NOT NULL,
	"descricao" text NOT NULL,
	"valor" integer NOT NULL,
	"data_emissao" date,
	"vencimento" date,
	"paga" boolean DEFAULT false NOT NULL,
	"parcelamento_id" uuid,
	"parcela_atual" integer,
	"total_parcelas" integer,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lancamentos_valor_positivo" CHECK ("lancamentos"."valor" > 0),
	CONSTRAINT "lancamentos_campos_por_tipo" CHECK (("lancamentos"."tipo" = 'receita' AND "lancamentos"."data_emissao" IS NOT NULL AND "lancamentos"."vencimento" IS NULL) OR ("lancamentos"."tipo" = 'despesa' AND "lancamentos"."vencimento" IS NOT NULL AND "lancamentos"."data_emissao" IS NULL))
);
--> statement-breakpoint
CREATE INDEX "caixinhas_user_id_idx" ON "caixinhas" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "lancamentos_user_id_idx" ON "lancamentos" USING btree ("user_id");
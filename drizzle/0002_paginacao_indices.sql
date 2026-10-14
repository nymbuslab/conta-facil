CREATE INDEX "caixinhas_user_criado_id_idx" ON "caixinhas" USING btree ("user_id","criado_em","id");--> statement-breakpoint
CREATE INDEX "lancamentos_user_criado_id_idx" ON "lancamentos" USING btree ("user_id","criado_em","id");

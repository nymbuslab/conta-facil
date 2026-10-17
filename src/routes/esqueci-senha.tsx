import { zodResolver } from '@hookform/resolvers/zod'
import { createRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { MarcaDestaque } from '@/components/marca-destaque'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/state/auth-context'

import { Route as rootRoute } from './__root'

const esqueciSenhaSchema = z.object({
  email: z.string().trim().email('Informe um e-mail válido'),
})

type EsqueciSenhaValues = z.infer<typeof esqueciSenhaSchema>

export function TelaEsqueciSenha() {
  const { solicitarRedefinicaoSenha } = useAuth()
  const [enviado, setEnviado] = useState(false)
  const form = useForm<EsqueciSenhaValues>({
    resolver: zodResolver(esqueciSenhaSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(dados: EsqueciSenhaValues) {
    try {
      await solicitarRedefinicaoSenha(dados.email)
    } catch {
      // O Better Auth sempre devolve sucesso para nao revelar se o e-mail existe; um erro aqui
      // so acontece por falha de rede/servico, e nesse caso a mensagem de "e-mail enviado"
      // continua sendo a resposta mais segura, sem vazar detalhe tecnico.
    } finally {
      setEnviado(true)
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-10">
      <MarcaDestaque />
      <Card className="w-full max-w-sm">
        {enviado ? (
          <>
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="font-display text-2xl">
                <h1>E-mail enviado</h1>
              </CardTitle>
              <CardDescription>
                Se o endereço estiver cadastrado, você vai receber em instantes um link com
                instruções para criar uma nova senha.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/login" className="block text-center text-sm font-semibold text-primary hover:underline">
                Voltar para o login
              </Link>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="font-display text-2xl">
                <h1>Recuperar senha</h1>
              </CardTitle>
              <CardDescription>
                Informe o e-mail da sua conta para receber um link de redefinição de senha.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            autoComplete="email"
                            inputMode="email"
                            placeholder="voce@exemplo.com"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Enviando...' : 'Enviar link de recuperação'}
                  </Button>
                </form>
              </Form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                <Link to="/login" className="font-semibold text-primary hover:underline">
                  Voltar para o login
                </Link>
              </p>
            </CardContent>
          </>
        )}
      </Card>
    </main>
  )
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/esqueci-senha',
  component: TelaEsqueciSenha,
})

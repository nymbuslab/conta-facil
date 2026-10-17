import { zodResolver } from '@hookform/resolvers/zod'
import { createRoute, Link, useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { MarcaDestaque } from '@/components/marca-destaque'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/state/auth-context'

import { Route as rootRoute } from './__root'

const redefinirSenhaSchema = z
  .object({
    novaSenha: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
    confirmarSenha: z.string(),
  })
  .refine((dados) => dados.novaSenha === dados.confirmarSenha, {
    message: 'As senhas precisam ser iguais',
    path: ['confirmarSenha'],
  })

type RedefinirSenhaValues = z.infer<typeof redefinirSenhaSchema>

const buscaSchema = z.object({
  token: z.string().optional(),
  error: z.string().optional(),
})

export function TelaRedefinirSenha() {
  const { redefinirSenha } = useAuth()
  const navegar = useNavigate()
  const { token, error } = Route.useSearch()
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erroEnvio, setErroEnvio] = useState<string | null>(null)
  const [concluido, setConcluido] = useState(false)
  const form = useForm<RedefinirSenhaValues>({
    resolver: zodResolver(redefinirSenhaSchema),
    defaultValues: { novaSenha: '', confirmarSenha: '' },
  })

  const linkInvalido = Boolean(error) || !token

  async function onSubmit(dados: RedefinirSenhaValues) {
    if (!token) return

    setErroEnvio(null)

    try {
      await redefinirSenha(dados.novaSenha, token)
      setConcluido(true)
    } catch {
      setErroEnvio('Não foi possível redefinir sua senha. O link pode ter expirado.')
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-10">
      <MarcaDestaque />
      <Card className="w-full max-w-sm">
        {linkInvalido ? (
          <>
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="font-display text-2xl">
                <h1>Link inválido ou expirado</h1>
              </CardTitle>
              <CardDescription>
                Esse link de redefinição de senha não é mais válido. Solicite um novo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="w-full">
                <Link to="/esqueci-senha">Solicitar novo link</Link>
              </Button>
            </CardContent>
          </>
        ) : concluido ? (
          <>
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="font-display text-2xl">
                <h1>Senha redefinida</h1>
              </CardTitle>
              <CardDescription>Sua senha foi alterada. Entre com a nova senha.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="w-full" onClick={() => void navegar({ to: '/login' })}>
                Ir para o login
              </Button>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="font-display text-2xl">
                <h1>Criar nova senha</h1>
              </CardTitle>
              <CardDescription>Escolha uma nova senha para sua conta.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
                  <FormField
                    control={form.control}
                    name="novaSenha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova senha</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={mostrarSenha ? 'text' : 'password'}
                              autoComplete="new-password"
                              className="h-11 pr-11"
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-1/2 h-11 w-11 -translate-y-1/2 text-muted-foreground hover:bg-transparent hover:text-foreground"
                            aria-label={mostrarSenha ? 'Ocultar senhas' : 'Mostrar senhas'}
                            onClick={() => setMostrarSenha((valor) => !valor)}
                          >
                            {mostrarSenha ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmarSenha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar nova senha</FormLabel>
                        <FormControl>
                          <Input
                            type={mostrarSenha ? 'text' : 'password'}
                            autoComplete="new-password"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {erroEnvio && (
                    <p role="alert" className="text-sm font-medium text-destructive">
                      {erroEnvio}
                    </p>
                  )}

                  <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </>
        )}
      </Card>
    </main>
  )
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/redefinir-senha',
  validateSearch: buscaSchema,
  component: TelaRedefinirSenha,
})

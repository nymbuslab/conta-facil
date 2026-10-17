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

const loginSchema = z.object({
  email: z.string().trim().email('Informe um e-mail válido'),
  senha: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
})

type LoginValues = z.infer<typeof loginSchema>

export function TelaLogin() {
  const { entrar } = useAuth()
  const navegar = useNavigate()
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erroAuth, setErroAuth] = useState<string | null>(null)
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', senha: '' },
  })

  async function onSubmit(dados: LoginValues) {
    setErroAuth(null)

    try {
      await entrar(dados.email, dados.senha)
      await navegar({ to: '/' })
    } catch {
      setErroAuth(
        'E-mail ou senha incorretos. Verifique os dados digitados e tente novamente.',
      )
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-10">
      <MarcaDestaque />
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="font-display text-2xl">
            <h1>Entre na sua conta</h1>
          </CardTitle>
          <CardDescription>Acesse seus lançamentos e caixinhas.</CardDescription>
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
              <FormField
                control={form.control}
                name="senha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={mostrarSenha ? 'text' : 'password'}
                          autoComplete="current-password"
                          className="h-11 pr-11"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-1/2 h-11 w-11 -translate-y-1/2 text-muted-foreground hover:bg-transparent hover:text-foreground"
                        aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                        onClick={() => setMostrarSenha((valor) => !valor)}
                      >
                        {mostrarSenha ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                      </Button>
                    </div>
                    <div className="flex justify-end">
                      <Link to="/esqueci-senha" className="text-sm text-muted-foreground hover:text-primary hover:underline">
                        Esqueci minha senha
                      </Link>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {erroAuth && (
                <p role="alert" className="text-sm font-medium text-destructive">
                  {erroAuth}
                </p>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </Form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Ainda não tem conta?{' '}
            <Link to="/cadastro" className="font-semibold text-primary hover:underline">
              Criar conta
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: TelaLogin,
})

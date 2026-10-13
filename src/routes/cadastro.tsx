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

const cadastroSchema = z
  .object({
    nome: z.string().trim().min(2, 'Informe seu nome'),
    email: z.string().trim().email('Informe um e-mail válido'),
    senha: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
    confirmarSenha: z.string(),
  })
  .refine((dados) => dados.senha === dados.confirmarSenha, {
    message: 'As senhas precisam ser iguais',
    path: ['confirmarSenha'],
  })

type CadastroValues = z.infer<typeof cadastroSchema>

export function TelaCadastro() {
  const { cadastrar } = useAuth()
  const navegar = useNavigate()
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erroAuth, setErroAuth] = useState<string | null>(null)
  const form = useForm<CadastroValues>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: { nome: '', email: '', senha: '', confirmarSenha: '' },
  })

  async function onSubmit(dados: CadastroValues) {
    setErroAuth(null)

    try {
      await cadastrar(dados.nome, dados.email, dados.senha)
      await navegar({ to: '/' })
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message.toLowerCase() : ''
      setErroAuth(
        mensagem.includes('exist') || mensagem.includes('already')
          ? 'Este e-mail já está cadastrado. Entre na sua conta para continuar.'
          : 'Não foi possível criar sua conta. Revise os dados e tente novamente.',
      )
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-10">
      <MarcaDestaque />
      <Card className="w-full max-w-sm shadow-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="font-display text-2xl">
            <h1>Crie sua conta</h1>
          </CardTitle>
          <CardDescription>Comece a organizar seus lançamentos e caixinhas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input autoComplete="name" placeholder="Como podemos chamar você?" className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        aria-pressed={mostrarSenha}
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
                    <FormLabel>Confirmar senha</FormLabel>
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

              {erroAuth && (
                <p role="alert" className="text-sm font-medium text-destructive">
                  {erroAuth}
                </p>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </form>
          </Form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cadastro',
  component: TelaCadastro,
})

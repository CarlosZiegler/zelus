import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { Link, redirect, useNavigation, useSubmit } from 'react-router'

import type { Route } from './+types/register'
import { auth } from '~/lib/auth/auth.server'
import { signIn } from '~/lib/auth/auth.client'
import { AzulejoPattern } from '~/components/brand/azulejo-pattern'
import { ZelusLogoTile } from '~/components/brand/zelus-logo-tile'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Field, FieldLabel, FieldDescription, FieldError } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { Separator } from '~/components/ui/separator'

const registerSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

type RegisterValues = z.infer<typeof registerSchema>

export function meta(_args: Route.MetaArgs) {
  return [{ title: 'Criar Conta — Zelus' }]
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const parsed = registerSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return { error: 'Dados inválidos.' }
  }

  const { name, email, password } = parsed.data

  const res = await auth.api.signUpEmail({
    body: { name, email, password },
    asResponse: true,
    headers: request.headers,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    return { error: body?.message || 'Erro ao criar conta.' }
  }

  const headers = new Headers()
  for (const cookie of res.headers.getSetCookie()) {
    headers.append('set-cookie', cookie)
  }

  return redirect('/onboarding', { headers })
}

export default function RegisterPage({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation()
  const submit = useSubmit()
  const isSubmitting = navigation.state === 'submitting'

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  })

  function onValid(_data: RegisterValues, e?: React.BaseSyntheticEvent) {
    if (e?.target) submit(e.target, { method: 'post' })
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <AzulejoPattern />
      <Card className="relative z-10 w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-2 flex justify-center">
            <ZelusLogoTile size={40} className="text-primary" />
          </div>
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>Comece a gerir o seu condomínio</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onValid)} className="grid gap-4">
            {actionData?.error && (
              <div className="bg-destructive/10 text-destructive rounded-xl px-3 py-2 text-sm">
                {actionData.error}
              </div>
            )}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nome</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="Seu nome"
                    autoComplete="name"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>E-mail</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    placeholder="nome@exemplo.com"
                    autoComplete="email"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Palavra-passe</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>Mínimo 8 caracteres</FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'A criar…' : 'Criar conta'}
            </Button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-muted-foreground text-xs">ou</span>
            <Separator className="flex-1" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => signIn.social({ provider: 'google', callbackURL: '/onboarding' })}
          >
            <GoogleIcon />
            Registrar com Google
          </Button>

          <p className="text-muted-foreground mt-4 text-center text-sm">
            Já tem conta?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="mr-2 size-4" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

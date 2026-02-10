import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { data, redirect, useFetcher } from 'react-router'

import type { Route } from './+types/index'
import { requireAuth } from '~/lib/auth/rbac'
import { auth } from '~/lib/auth/auth.server'
import { db } from '~/lib/db'
import { fractions, member } from '~/lib/db/schema'
import { eq } from 'drizzle-orm'

import { AzulejoPattern } from '~/components/brand/azulejo-pattern'
import { ZelusLogoTile } from '~/components/brand/zelus-logo-tile'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Field, FieldLabel, FieldError } from '~/components/ui/field'
import { Input } from '~/components/ui/input'

const createOrgSchema = z.object({
  name: z.string().min(1, 'Nome do condomínio obrigatório'),
  city: z.string().min(1, 'Cidade obrigatória'),
  totalFractions: z.string().optional(),
  notes: z.string().optional(),
})

type CreateOrgValues = z.infer<typeof createOrgSchema>
type FractionsValues = { labels: { value: string }[] }

export function meta(_args: Route.MetaArgs) {
  return [{ title: 'Configurar Condomínio — Zelus' }]
}

function forwardCookies(res: Response): Headers {
  const headers = new Headers()
  for (const cookie of res.headers.getSetCookie()) {
    headers.append('set-cookie', cookie)
  }
  return headers
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const { session, user } = requireAuth(context)

  if (session.session.activeOrganizationId) {
    throw redirect('/dashboard')
  }

  const memberships = await db
    .select({ organizationId: member.organizationId })
    .from(member)
    .where(eq(member.userId, user.id))
    .limit(1)

  if (memberships.length > 0) {
    const res = await auth.api.setActiveOrganization({
      body: { organizationId: memberships[0].organizationId },
      asResponse: true,
      headers: request.headers,
    })
    throw redirect('/dashboard', { headers: forwardCookies(res) })
  }

  return { userName: user.name }
}

export async function action({ request, context }: Route.ActionArgs) {
  requireAuth(context)
  const formData = await request.formData()
  const intent = formData.get('intent') as string

  if (intent === 'create-org') {
    const parsed = createOrgSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) {
      return { error: 'Dados inválidos.' }
    }

    const slug = parsed.data.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const res = await auth.api.createOrganization({
      body: {
        name: parsed.data.name,
        slug,
        city: parsed.data.city || undefined,
        totalFractions: parsed.data.totalFractions || undefined,
        notes: parsed.data.notes || undefined,
      },
      asResponse: true,
      headers: request.headers,
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => null)
      return { error: errData?.message || 'Erro ao criar organização.' }
    }

    const orgData = await res.json()
    return data({ orgId: orgData.id as string, step: 2 }, { headers: forwardCookies(res) })
  }

  if (intent === 'create-fractions') {
    const orgId = formData.get('orgId') as string
    const labels = formData.getAll('label') as string[]

    for (const label of labels) {
      if (label.trim()) {
        await db.insert(fractions).values({
          orgId,
          label: label.trim(),
        })
      }
    }

    return { orgId, step: 3 }
  }

  if (intent === 'finish') {
    const orgId = formData.get('orgId') as string
    const res = await auth.api.setActiveOrganization({
      body: { organizationId: orgId },
      asResponse: true,
      headers: request.headers,
    })
    return redirect('/dashboard', { headers: forwardCookies(res) })
  }

  return { error: 'Ação desconhecida.' }
}

export default function OnboardingPage() {
  const fetcher = useFetcher<typeof action>()
  const isSubmitting = fetcher.state === 'submitting'

  const [step, setStep] = useState(1)
  const [orgId, setOrgId] = useState('')
  const [prevData, setPrevData] = useState<typeof fetcher.data>(undefined)

  // Sync state from fetcher responses (derived state pattern)
  if (fetcher.data !== prevData) {
    setPrevData(fetcher.data)
    if (fetcher.data && 'orgId' in fetcher.data) setOrgId(fetcher.data.orgId as string)
    if (fetcher.data && 'step' in fetcher.data) setStep(fetcher.data.step as number)
  }

  const serverError =
    fetcher.data && 'error' in fetcher.data ? (fetcher.data.error as string) : null

  // Step 1 form
  const orgForm = useForm<CreateOrgValues>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: { name: '', city: '', totalFractions: '', notes: '' },
  })

  // Step 2 form
  const fractionsForm = useForm<FractionsValues>({
    defaultValues: { labels: [{ value: '' }] },
  })
  const { fields, append, remove } = useFieldArray({
    control: fractionsForm.control,
    name: 'labels',
  })

  function onCreateOrg(values: CreateOrgValues) {
    const formData = new FormData()
    formData.set('intent', 'create-org')
    formData.set('name', values.name)
    formData.set('city', values.city)
    if (values.totalFractions) formData.set('totalFractions', values.totalFractions)
    if (values.notes) formData.set('notes', values.notes)
    fetcher.submit(formData, { method: 'post' })
  }

  function onCreateFractions(values: FractionsValues) {
    const formData = new FormData()
    formData.set('intent', 'create-fractions')
    formData.set('orgId', orgId)
    values.labels
      .filter((l) => l.value.trim())
      .forEach((l) => formData.append('label', l.value.trim()))
    fetcher.submit(formData, { method: 'post' })
  }

  function handleFinish() {
    const formData = new FormData()
    formData.set('intent', 'finish')
    formData.set('orgId', orgId)
    fetcher.submit(formData, { method: 'post' })
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <AzulejoPattern />
      <Card className="relative z-10 w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mb-2 flex justify-center">
            <ZelusLogoTile size={40} className="text-primary" />
          </div>
          <CardTitle>
            {step === 1 && 'Configurar condomínio'}
            {step === 2 && 'Adicionar frações'}
            {step === 3 && 'Tudo pronto!'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Passo 1 de 3 — Dados do condomínio'}
            {step === 2 && 'Passo 2 de 3 — Frações do edifício'}
            {step === 3 && 'Passo 3 de 3 — Configuração concluída'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {serverError && (
            <div className="bg-destructive/10 text-destructive mb-4 rounded-xl px-3 py-2 text-sm">
              {serverError}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={orgForm.handleSubmit(onCreateOrg)} className="grid gap-4">
              <Controller
                name="name"
                control={orgForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Nome do condomínio *</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="Ex: Edifício Aurora"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="city"
                control={orgForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Cidade / localização *</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="Ex: Lisboa"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="totalFractions"
                control={orgForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Número total de frações</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="number"
                      placeholder="Ex: 12"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="notes"
                control={orgForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Notas internas</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="Opcional"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'A criar…' : 'Continuar'}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={fractionsForm.handleSubmit(onCreateFractions)} className="grid gap-4">
              <p className="text-muted-foreground text-sm">
                Adicione as frações do edifício. Pode usar nomes livres (ex: &quot;T3 – 2º
                Esq.&quot;).
              </p>
              {fields.map((item, index) => (
                <div key={item.id} className="flex gap-2">
                  <Controller
                    name={`labels.${index}.value`}
                    control={fractionsForm.control}
                    render={({ field }) => (
                      <Input {...field} placeholder={`Fração ${index + 1}`} className="flex-1" />
                    )}
                  />
                  {fields.length > 1 && (
                    <Button type="button" variant="ghost" onClick={() => remove(index)}>
                      ✕
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => append({ value: '' })}>
                + Adicionar fração
              </Button>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'A guardar…' : 'Continuar'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setStep(3)}>
                  Saltar
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="grid gap-4 text-center">
              <p className="text-muted-foreground text-sm">
                O seu condomínio está configurado. Pode convidar administradores adicionais mais
                tarde nas definições.
              </p>
              <Button onClick={handleFinish} disabled={isSubmitting}>
                {isSubmitting ? 'A entrar…' : 'Ir para o painel'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

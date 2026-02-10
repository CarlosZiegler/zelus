import { redirect, useNavigation, Form, Link } from 'react-router'
import { z } from 'zod'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft02Icon } from '@hugeicons/core-free-icons'

import type { Route } from './+types/new'
import { orgContext, userContext } from '~/lib/auth/context'
import { createFraction } from '~/lib/services/fractions'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Field, FieldLabel } from '~/components/ui/field'
import { Textarea } from '~/components/ui/textarea'

export function meta(_args: Route.MetaArgs) {
  return [{ title: 'Nova Fração — Zelus' }]
}

const createSchema = z.object({
  label: z.string().min(1, 'Nome obrigatório'),
  description: z.string().optional(),
})

export async function action({ request, context }: Route.ActionArgs) {
  const { orgId, effectiveRole } = context.get(orgContext)
  const user = context.get(userContext)

  if (effectiveRole !== 'org_admin') {
    throw new Response('Forbidden', { status: 403 })
  }

  const formData = await request.formData()
  const parsed = createSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return { error: 'Nome da fração é obrigatório.' }
  }

  await createFraction(orgId, parsed.data, user.id)
  return redirect('/fractions')
}

export default function NewFractionPage({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  return (
    <div className="mx-auto max-w-md">
      <div className="flex items-center gap-3">
        <Button render={<Link to="/fractions" />} variant="ghost" size="icon">
          <HugeiconsIcon icon={ArrowLeft02Icon} size={18} strokeWidth={2} />
        </Button>
        <h1 className="text-lg font-semibold tracking-tight">Nova Fração</h1>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Dados da fração</CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="post" className="grid gap-4">
            {actionData?.error && (
              <div className="bg-destructive/10 text-destructive rounded-xl px-4 py-3 text-sm">
                {actionData.error}
              </div>
            )}

            <Field>
              <FieldLabel htmlFor="label">Nome</FieldLabel>
              <Input id="label" name="label" placeholder="Ex: 1 D, RC Esq" required />
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Descrição (opcional)</FieldLabel>
              <Textarea
                id="description"
                name="description"
                placeholder="Notas sobre esta fração"
                rows={3}
              />
            </Field>

            <div className="flex justify-end gap-3 pt-2">
              <Button render={<Link to="/fractions" />} variant="outline">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'A criar…' : 'Criar fração'}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

import { Form } from 'react-router'
import { z } from 'zod'

import type { Route } from './+types/categories'
import { orgContext, userContext } from '~/lib/auth/context'
import { listCategories, createCategory, deleteCategory } from '~/lib/services/ticket-categories'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Field, FieldLabel } from '~/components/ui/field'

export function meta(_args: Route.MetaArgs) {
  return [{ title: 'Categorias — Zelus' }]
}

export async function loader({ context }: Route.LoaderArgs) {
  const { orgId } = context.get(orgContext)
  const categories = await listCategories(orgId)

  return { categories }
}

const createSchema = z.object({
  label: z.string().min(1, 'Nome é obrigatório'),
})

export async function action({ request, context }: Route.ActionArgs) {
  const { orgId } = context.get(orgContext)
  const user = context.get(userContext)
  const formData = await request.formData()
  const data = Object.fromEntries(formData)

  if (data.intent === 'create') {
    const parsed = createSchema.safeParse(data)
    if (!parsed.success) return { error: 'Dados inválidos.' }

    await createCategory(orgId, parsed.data.label, user.id)
    return { success: true }
  }

  if (data.intent === 'delete') {
    const categoryId = String(data.categoryId)

    try {
      await deleteCategory(orgId, categoryId, user.id)
      return { success: true }
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Erro ao apagar categoria.' }
    }
  }

  return { error: 'Ação desconhecida.' }
}

export default function CategoriesPage({ loaderData, actionData }: Route.ComponentProps) {
  const { categories } = loaderData

  return (
    <div>
      <h1 className="text-lg font-semibold tracking-tight">Categorias</h1>
      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        {/* Create Category */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Nova categoria</CardTitle>
            </CardHeader>
            <CardContent>
              {actionData?.error && (
                <div className="bg-destructive/10 text-destructive mb-3 rounded-xl px-3 py-2 text-sm">
                  {actionData.error}
                </div>
              )}
              {actionData?.success && (
                <div className="bg-primary/10 text-primary mb-3 rounded-xl px-3 py-2 text-sm">
                  Categoria criada.
                </div>
              )}

              <Form method="post" className="grid gap-3">
                <input type="hidden" name="intent" value="create" />
                <Field>
                  <FieldLabel htmlFor="category-label">Nome</FieldLabel>
                  <Input
                    id="category-label"
                    name="label"
                    type="text"
                    placeholder="Ex: Canalização"
                    required
                  />
                </Field>

                <Button type="submit" className="mt-1">
                  Criar
                </Button>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Existing Categories */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Categorias</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {categories.length === 0 ? (
                <p className="text-muted-foreground px-4 py-6 text-center text-sm">
                  Nenhuma categoria criada.
                </p>
              ) : (
                <div className="divide-y">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between px-4 py-2.5"
                    >
                      <p className="text-sm font-medium">{category.label}</p>
                      <Form method="post">
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="categoryId" value={category.id} />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                        >
                          Apagar
                        </Button>
                      </Form>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

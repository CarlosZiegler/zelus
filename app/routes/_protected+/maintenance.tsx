import type { Route } from './+types/maintenance'

export function meta(_args: Route.MetaArgs) {
  return [{ title: 'Manutenções — Zelus' }]
}

export default function MaintenancePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight">Manutenções</h1>
        <p className="text-muted-foreground text-sm">
          Histórico de intervenções e registos de manutenção do condomínio.
        </p>
      </header>

      <div className="bg-card ring-foreground/10 rounded-2xl p-5 ring-1">
        <p className="text-sm">
          Ainda não há registos de manutenção nesta versão. (Sugestão: lista + filtro por fornecedor
          + upload de fotos/documentos por ocorrência.)
        </p>
      </div>
    </div>
  )
}

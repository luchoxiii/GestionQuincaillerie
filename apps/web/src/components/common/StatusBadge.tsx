import * as React from "react"
import { Badge } from "@/components/ui/badge"

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Activo", variant: "default" },
  inactive: { label: "Inactivo", variant: "secondary" },
  pending: { label: "Pendiente", variant: "outline" },
  cancelled: { label: "Cancelado", variant: "destructive" },
  completed: { label: "Completado", variant: "default" },
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const mappedStatus = statusMap[status.toLowerCase()] || { label: status, variant: "outline" }

  return (
    <Badge variant={mappedStatus.variant} className={className}>
      {mappedStatus.label}
    </Badge>
  )
}

import type { ReactNode } from 'react'
import { SidebarTrigger } from '@/components/ui/sidebar'

export function SiteHeader({
  title,
  subtitle,
  action
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <header
      className={`flex shrink-0 items-center justify-between gap-4 border-b bg-white px-4 ${
        subtitle ? 'h-16' : 'h-12'
      }`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <div className="min-w-0">
          <h1 className="text-base font-semibold leading-5">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}

import { Globe2 } from 'lucide-react'

export function EmptyPage() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border bg-card text-center">
      <span className="mb-4 inline-flex size-[54px] items-center justify-center rounded-xl bg-accent text-primary">
        <Globe2 className="size-6" />
      </span>
      <h3 className="text-lg font-semibold">代理</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        该模块已预留入口，后续可按 FluxBrowser 的正式配置继续扩展。
      </p>
    </div>
  )
}

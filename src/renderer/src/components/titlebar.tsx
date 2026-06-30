import { Infinity as InfinityIcon, Maximize2, Minus, X } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function Titlebar({ serviceOnline }: { serviceOnline: boolean }) {
  return (
    <header className="flex h-11 items-center justify-between border-b bg-background px-3 [-webkit-app-region:drag]">
      <div className="flex items-center gap-2">
        <Avatar className="size-8 rounded-lg bg-primary text-primary-foreground">
          <AvatarFallback className="rounded-lg bg-transparent text-white">
            <InfinityIcon className="size-[18px]" />
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">CloakBrowserApp</span>
          <Badge variant="secondary" className="bg-muted text-foreground">
            v1.0.0
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
          <span
            className={
              serviceOnline
                ? 'size-2 rounded-full bg-[#17b26a]'
                : 'size-2 rounded-full bg-[#98a2b3]'
            }
          />
          {serviceOnline ? '本地服务运行中' : '预览模式'}
        </div>
        <div className="flex items-center [-webkit-app-region:no-drag]">
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-md text-[#4d5668] hover:bg-accent hover:text-foreground"
            onClick={() => window.appWindow?.minimize()}
          >
            <Minus className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-md text-[#4d5668] hover:bg-accent hover:text-foreground"
            onClick={() => window.appWindow?.toggleMaximize()}
          >
            <Maximize2 className="size-[15px]" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-md text-[#4d5668] hover:bg-destructive hover:text-white"
            onClick={() => window.appWindow?.close()}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}

import { Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { ProxyInput, ProxyProtocol, SavedProxy } from '@/types'

interface ProxyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: SavedProxy | null
  formValues: ProxyInput
  onFormChange: (values: ProxyInput) => void
  saving: boolean
  formError: string | null
  onSave: () => void
}

function Field({
  label,
  children,
  className
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  )
}

function previewUrl(values: ProxyInput): string {
  if (!values.host.trim() || !values.port) return '填写主机和端口后自动生成'
  const host = values.host.trim().includes(':')
    ? `[${values.host.trim().replace(/^\[|\]$/g, '')}]`
    : values.host.trim()
  const auth = values.username.trim()
    ? `${encodeURIComponent(values.username.trim())}${values.password ? ':••••••' : ''}@`
    : ''
  return `${values.protocol}://${auth}${host}:${values.port}`
}

export function ProxyDialog({
  open,
  onOpenChange,
  editing,
  formValues,
  onFormChange,
  saving,
  formError,
  onSave
}: ProxyDialogProps) {
  const update = (patch: Partial<ProxyInput>) => onFormChange({ ...formValues, ...patch })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[620px]">
        <DialogHeader>
          <DialogTitle>{editing ? '编辑代理' : '新增代理'}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-2">
          <Field label="代理名称" className="col-span-2">
            <Input
              autoFocus
              placeholder="例如：日本住宅代理"
              value={formValues.name}
              onChange={(event) => update({ name: event.target.value })}
            />
          </Field>

          <Field label="代理协议">
            <Select
              value={formValues.protocol}
              onValueChange={(value) => update({ protocol: value as ProxyProtocol })}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="http">HTTP</SelectItem>
                <SelectItem value="https">HTTPS</SelectItem>
                <SelectItem value="socks4">SOCKS4</SelectItem>
                <SelectItem value="socks5">SOCKS5</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="端口">
            <Input
              type="number"
              min={1}
              max={65535}
              placeholder="例如：1080"
              value={formValues.port ?? ''}
              onChange={(event) =>
                update({ port: event.target.value ? Number(event.target.value) : undefined })
              }
            />
          </Field>

          <Field label="主机 / IP" className="col-span-2">
            <Input
              placeholder="例如：proxy.example.com 或 192.168.1.10"
              value={formValues.host}
              onChange={(event) => update({ host: event.target.value })}
            />
          </Field>

          <Field label="用户名（可选）">
            <Input
              autoComplete="off"
              placeholder="代理账号"
              value={formValues.username}
              onChange={(event) => update({ username: event.target.value })}
            />
          </Field>

          <Field label="密码（可选）">
            <Input
              type="password"
              autoComplete="new-password"
              placeholder="代理密码"
              value={formValues.password}
              onChange={(event) => update({ password: event.target.value })}
            />
          </Field>

          <div className="col-span-2 rounded-lg border bg-muted/40 px-3.5 py-3">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Link2 className="size-3.5" />
              保存后生成的代理 URL
            </div>
            <p className="break-all font-mono text-sm text-foreground">
              {previewUrl(formValues)}
            </p>
          </div>

          {formError && <p className="col-span-2 text-sm text-destructive">{formError}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            取消
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? '保存中...' : editing ? '保存' : '保存代理'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { BrowserProfile, ProfileInput } from '@/types'

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: BrowserProfile | null
  formValues: ProfileInput
  onFormChange: (values: ProfileInput) => void
  saving: boolean
  nameError: string | null
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

export function ProfileDialog({
  open,
  onOpenChange,
  editing,
  formValues,
  onFormChange,
  saving,
  nameError,
  onSave
}: ProfileDialogProps) {
  const update = (patch: Partial<ProfileInput>) =>
    onFormChange({ ...formValues, ...patch })

  const numValue = (v: number | undefined) => (v === undefined ? '' : v)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px]">
        <DialogHeader>
          <DialogTitle>{editing ? '编辑环境' : '创建环境'}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <Field label="环境名称" className="col-span-1">
            <Input
              placeholder="例如：日本调研环境"
              value={formValues.name ?? ''}
              onChange={(e) => update({ name: e.target.value })}
            />
            {nameError && <p className="text-sm text-destructive">{nameError}</p>}
          </Field>
          <Field label="启动网址" className="col-span-1">
            <Input
              placeholder="https://example.com"
              value={formValues.startUrl ?? ''}
              onChange={(e) => update({ startUrl: e.target.value })}
            />
          </Field>

          <Field label="代理" className="col-span-2">
            <Input
              placeholder="socks5://user:pass@host:port，留空则不使用代理"
              value={formValues.proxy ?? ''}
              onChange={(e) => update({ proxy: e.target.value })}
            />
          </Field>

          <Field label="时区" className="col-span-1">
            <Input
              placeholder="Asia/Shanghai"
              value={formValues.timezone ?? ''}
              onChange={(e) => update({ timezone: e.target.value })}
            />
          </Field>
          <Field label="语言" className="col-span-1">
            <Input
              placeholder="zh-CN"
              value={formValues.locale ?? ''}
              onChange={(e) => update({ locale: e.target.value })}
            />
          </Field>

          <Field label="屏幕宽度" className="col-span-1">
            <Input
              type="number"
              value={numValue(formValues.screenWidth)}
              onChange={(e) =>
                update({ screenWidth: e.target.value === '' ? undefined : Number(e.target.value) })
              }
            />
          </Field>
          <Field label="屏幕高度" className="col-span-1">
            <Input
              type="number"
              value={numValue(formValues.screenHeight)}
              onChange={(e) =>
                update({ screenHeight: e.target.value === '' ? undefined : Number(e.target.value) })
              }
            />
          </Field>

          <Field label="CPU 线程" className="col-span-1">
            <Input
              type="number"
              value={numValue(formValues.hardwareConcurrency)}
              onChange={(e) =>
                update({
                  hardwareConcurrency: e.target.value === '' ? undefined : Number(e.target.value)
                })
              }
            />
          </Field>
          <Field label="设备内存（GB）" className="col-span-1">
            <Input
              type="number"
              value={numValue(formValues.deviceMemory)}
              onChange={(e) =>
                update({ deviceMemory: e.target.value === '' ? undefined : Number(e.target.value) })
              }
            />
          </Field>

          <Field label="存储配额（MB）" className="col-span-2">
            <Input
              type="number"
              value={numValue(formValues.storageQuotaMb)}
              onChange={(e) =>
                update({
                  storageQuotaMb: e.target.value === '' ? undefined : Number(e.target.value)
                })
              }
            />
          </Field>

          <div className="col-span-2 flex items-center gap-2.5 rounded-xl border bg-muted/40 p-3.5">
            <Checkbox
              id="geoip"
              checked={!!formValues.geoip}
              onCheckedChange={(v) => update({ geoip: !!v })}
            />
            <Label htmlFor="geoip" className="cursor-pointer text-sm">
              根据代理自动匹配时区和语言
            </Label>
            <ShieldCheck className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">同时减少 WebRTC IP 泄露风险</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            取消
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? '保存中...' : editing ? '保存' : '创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { useEffect, useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { BrowserProfile, ProfileInput, SavedProxy } from '@/types'

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: BrowserProfile | null
  formValues: ProfileInput
  onFormChange: (values: ProfileInput) => void
  saving: boolean
  nameError: string | null
  installedBrowserVersions: string[]
  savedProxies: SavedProxy[]
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
  installedBrowserVersions,
  savedProxies,
  onSave
}: ProfileDialogProps) {
  const [proxyChoice, setProxyChoice] = useState('none')
  const update = (patch: Partial<ProfileInput>) =>
    onFormChange({ ...formValues, ...patch })

  const numValue = (v: number | undefined) => (v === undefined ? '' : v)

  useEffect(() => {
    if (!open) return
    if (!formValues.proxy) {
      setProxyChoice('none')
      return
    }
    const savedProxy = savedProxies.find((proxy) => proxy.url === formValues.proxy)
    setProxyChoice(savedProxy?.id ?? 'custom')
  }, [open, editing?.id, savedProxies])

  const changeProxyChoice = (value: string) => {
    setProxyChoice(value)
    if (value === 'none') {
      update({ proxy: '' })
      return
    }
    if (value === 'custom') {
      if (savedProxies.some((proxy) => proxy.id === proxyChoice)) {
        update({ proxy: '' })
      }
      return
    }
    const selected = savedProxies.find((proxy) => proxy.id === value)
    if (selected) update({ proxy: selected.url })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid max-h-[calc(100vh-2rem)] max-w-[720px] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{editing ? '编辑环境' : '创建环境'}</DialogTitle>
        </DialogHeader>

        <div className="-mr-2 min-h-0 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4 pt-2">
            <Field label="环境名称" className="col-span-1">
              <Input
                placeholder="例如：工作环境"
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

            <Field label="浏览器版本" className="col-span-2">
              <Select
                value={formValues.browserVersion || undefined}
                onValueChange={(value) => update({ browserVersion: value })}
                disabled={installedBrowserVersions.length === 0}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue
                    placeholder={
                      installedBrowserVersions.length
                        ? '请选择浏览器版本'
                        : '未下载任何浏览器内核'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {installedBrowserVersions.map((version) => (
                    <SelectItem key={version} value={version}>
                      Chromium {version}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {installedBrowserVersions.length
                  ? '仅显示已下载到本机的浏览器内核版本'
                  : '请先前往内核下载页面下载当前系统可用版本'}
              </p>
            </Field>

            <Field label="代理" className="col-span-2">
              <Select value={proxyChoice} onValueChange={changeProxyChoice}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="请选择代理" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">不使用代理</SelectItem>
                  {savedProxies.map((proxy) => (
                    <SelectItem key={proxy.id} value={proxy.id}>
                      {proxy.name} · {proxy.protocol}://{proxy.host}:{proxy.port}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">自定义代理 URL</SelectItem>
                </SelectContent>
              </Select>
              {proxyChoice === 'custom' && (
                <Input
                  placeholder="socks5://user:pass@host:port"
                  value={formValues.proxy ?? ''}
                  onChange={(event) => update({ proxy: event.target.value })}
                />
              )}
              <p className="text-xs text-muted-foreground">
                可选择代理页中已保存的代理，也可以直接填写完整 URL
              </p>
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
        </div>

        <DialogFooter className="border-t bg-background pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            取消
          </Button>
          <Button
            onClick={onSave}
            disabled={saving || installedBrowserVersions.length === 0}
          >
            {saving ? '保存中...' : editing ? '保存' : '创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

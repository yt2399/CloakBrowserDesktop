import { useState } from 'react'
import { Folders, FolderInput, FolderOpen, Info, LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface WorkspacePaths {
  workspaceDirectory: string
  kernelDirectory: string
  profilesDirectory: string
}

interface SettingsPageProps {
  paths: WorkspacePaths | null
  onChange: (paths: WorkspacePaths) => void
}

export function SettingsPage({ paths, onChange }: SettingsPageProps) {
  const [choosing, setChoosing] = useState(false)
  const [opening, setOpening] = useState(false)

  const choose = async () => {
    setChoosing(true)
    try {
      const next = await window.workspace.chooseDirectory()
      if (next) {
        onChange(next)
        toast.success('工作目录已更新')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '更改工作目录失败')
    } finally {
      setChoosing(false)
    }
  }

  const open = async () => {
    if (!paths) return
    setOpening(true)
    try {
      await window.workspace.revealWorkspace()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '打开目录失败')
    } finally {
      setOpening(false)
    }
  }

  return (
    <div className="max-w-[900px] space-y-4">
      <div className="mb-1">
        <h2 className="text-base font-semibold">存储位置</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          配置 CloakBrowser 内核缓存与浏览器环境统一使用的工作目录。
        </p>
      </div>

      <article className="rounded-xl border bg-card p-5">
        <div className="flex items-start justify-between gap-5">
          <div className="flex min-w-0 items-start gap-3">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent">
              <Folders className="size-5" />
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-semibold">工作目录</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                内核缓存与浏览器环境统一保存在此目录下，包含
                <code className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono text-xs">kernels/</code>
                与
                <code className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono text-xs">profiles/</code>
                两个子目录。
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" onClick={choose} disabled={choosing}>
              {choosing ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <FolderInput className="size-4" />
              )}
              更改目录
            </Button>
            <Button variant="outline" size="sm" onClick={open} disabled={!paths || opening}>
              {opening ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <FolderOpen className="size-4" />
              )}
              打开目录
            </Button>
          </div>
        </div>

        <div className="mt-4 rounded-lg border bg-muted/30 px-3.5 py-3">
          {paths ? (
            <p className="break-all font-mono text-xs leading-5 text-foreground" title={paths.workspaceDirectory}>
              {paths.workspaceDirectory}
            </p>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <LoaderCircle className="size-3.5 animate-spin" />
              正在读取工作目录...
            </div>
          )}
        </div>
      </article>

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
        <Info className="mt-0.5 size-4 shrink-0" />
        <div className="text-sm leading-6">
          <p className="font-medium">更换工作目录后，已有的浏览器环境会保留在原位置</p>
          <p className="mt-1 text-amber-800/90">
            系统不会自动迁移旧数据。如需在新位置继续使用，请将旧环境对应的
            <code className="mx-1 rounded bg-amber-100 px-1.5 py-0.5 font-mono text-[11px]">userDataDir</code>
            文件夹手动移动到新工作目录的
            <code className="mx-1 rounded bg-amber-100 px-1.5 py-0.5 font-mono text-[11px]">profiles/</code>
            子目录下。新的下载与新建环境会直接使用新工作目录。
          </p>
        </div>
      </div>
    </div>
  )
}

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Edit3,
  MoreVertical,
  Play,
  Square
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { formatTime } from '@/hooks/use-profiles'
import type { BrowserProfile, ProfileStatus } from '@/types'

interface ProfilesTableProps {
  loading: boolean
  pagedProfiles: BrowserProfile[]
  selectedKeys: string[]
  onSelectionChange: (keys: string[]) => void
  allFilteredIds: string[]
  currentPage: number
  totalPages: number
  total: number
  gotoPage: (n: number) => void
  onOpen: (id: string) => void
  onClose: (id: string) => void
  onEdit: (profile: BrowserProfile) => void
  onDelete: (profile: BrowserProfile) => void
}

function StatusBadge({ status }: { status: ProfileStatus }) {
  if (status === 'running') {
    return (
      <Badge variant="secondary" className="gap-1 bg-[#e9f8ef] text-[#079455]">
        <CheckCircle2 className="size-3" />
        运行中
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="gap-1 bg-[#f2f4f7] text-[#667085]">
      <Circle className="size-3" />
      已停止
    </Badge>
  )
}

function platformLabel(platform: BrowserProfile['platform']): string {
  if (platform === 'macos') return 'macOS'
  return platform[0].toUpperCase() + platform.slice(1)
}

export function ProfilesTable({
  loading,
  pagedProfiles,
  selectedKeys,
  onSelectionChange,
  allFilteredIds,
  currentPage,
  totalPages,
  total,
  gotoPage,
  onOpen,
  onClose,
  onEdit,
  onDelete
}: ProfilesTableProps) {
  const allSelected =
    allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedKeys.includes(id))
  const someSelected = allFilteredIds.some((id) => selectedKeys.includes(id))

  const toggleAll = () => {
    if (allSelected) onSelectionChange([])
    else onSelectionChange(allFilteredIds)
  }

  const toggleRow = (id: string) => {
    if (selectedKeys.includes(id)) {
      onSelectionChange(selectedKeys.filter((key) => key !== id))
    } else {
      onSelectionChange([...selectedKeys, id])
    }
  }

  return (
    <div className="flex min-w-0 flex-col overflow-x-auto rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-b">
            <TableHead className="w-[52px] px-4">
              <Checkbox
                checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                onCheckedChange={toggleAll}
                aria-label="全选"
              />
            </TableHead>
            <TableHead className="h-[50px] px-4 text-[13px] font-semibold text-[#344054]">名称</TableHead>
            <TableHead className="h-[50px] px-4 text-[13px] font-semibold text-[#344054]">状态</TableHead>
            <TableHead className="h-[50px] px-4 text-[13px] font-semibold text-[#344054]">代理</TableHead>
            <TableHead className="h-[50px] px-4 text-[13px] font-semibold text-[#344054]">时区·语言</TableHead>
            <TableHead className="h-[50px] px-4 text-[13px] font-semibold text-[#344054]">最近打开</TableHead>
            <TableHead className="h-[50px] px-4 text-right text-[13px] font-semibold text-[#344054]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, rowIdx) => (
              <TableRow key={`skeleton-${rowIdx}`} className="border-b">
                <TableCell className="px-4 py-3"><Skeleton className="h-5 w-5" /></TableCell>
                <TableCell className="px-4 py-3"><Skeleton className="h-5 w-44" /></TableCell>
                <TableCell className="px-4 py-3"><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell className="px-4 py-3"><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell className="px-4 py-3"><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell className="px-4 py-3"><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell className="px-4 py-3"><Skeleton className="ml-auto h-5 w-24" /></TableCell>
              </TableRow>
            ))
          ) : pagedProfiles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                暂无环境数据
              </TableCell>
            </TableRow>
          ) : (
            pagedProfiles.map((record) => (
              <TableRow key={record.id} className="border-b last:border-0">
                <TableCell className="px-4 py-3">
                  <Checkbox
                    checked={selectedKeys.includes(record.id)}
                    onCheckedChange={() => toggleRow(record.id)}
                    aria-label={`选择 ${record.name}`}
                  />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9 rounded-lg bg-primary text-primary-foreground">
                      <AvatarFallback className="rounded-lg bg-transparent text-sm font-semibold text-white">
                        {record.name.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate font-medium text-[#344054]">{record.name}</span>
                      <span
                        className="truncate font-mono text-[11px] text-muted-foreground"
                        title={
                          record.browserVersion
                            ? `Chromium ${record.browserVersion} · ${platformLabel(record.platform)}`
                            : platformLabel(record.platform)
                        }
                      >
                        {record.browserVersion
                          ? `Chromium ${record.browserVersion} · ${platformLabel(record.platform)}`
                          : `未选择版本 · ${platformLabel(record.platform)}`}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3"><StatusBadge status={record.status} /></TableCell>
                <TableCell className="px-4 py-3">
                  {record.proxy ? (
                    <span
                      className="block max-w-[220px] truncate font-mono text-xs text-[#475467]"
                      title={record.proxy}
                    >
                      {record.proxy}
                    </span>
                  ) : (
                    <Badge variant="secondary" className="bg-[#f2f4f7] text-[#667085]">无代理</Badge>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate font-mono text-xs text-[#475467]" title={record.timezone}>
                      {record.timezone}
                    </span>
                    <span className="truncate text-xs text-muted-foreground" title={record.locale}>
                      {record.locale}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-xs text-muted-foreground">
                  {formatTime(record.lastOpenedAt)}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {record.status === 'running' ? (
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8 rounded-lg"
                        onClick={() => onClose(record.id)}
                        title="停止"
                      >
                        <Square className="size-3.5" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8 rounded-lg border-foreground/20 text-foreground hover:bg-accent"
                        onClick={() => onOpen(record.id)}
                        title="启动"
                      >
                        <Play className="size-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg"
                      onClick={() => onEdit(record)}
                      title="编辑"
                    >
                      <Edit3 className="size-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-lg"
                          title="更多"
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>复制配置</DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => onDelete(record)}
                        >
                          删除环境
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between border-t px-5 py-3">
        <span className="text-sm text-muted-foreground">共 {total} 项</span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={currentPage <= 1}
            onClick={() => gotoPage(currentPage - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          {Array.from({ length: totalPages }).map((_, idx) => {
            const p = idx + 1
            return (
              <Button
                key={p}
                variant={p === currentPage ? 'default' : 'outline'}
                size="icon"
                className="size-8 text-sm"
                onClick={() => gotoPage(p)}
              >
                {p}
              </Button>
            )
          })}
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={currentPage >= totalPages}
            onClick={() => gotoPage(currentPage + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

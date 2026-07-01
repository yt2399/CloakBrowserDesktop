import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { profileApi } from '../request'
import type { BrowserProfile, ProfileInput, ProfileStatus } from '../types'
import { startProfilePolling } from './profile-polling'

const PAGE_SIZE = 8
const PROFILE_STATUS_POLL_INTERVAL_MS = 3000

const defaultForm: ProfileInput = {
  name: '',
  proxy: '',
  geoip: true,
  timezone: 'Asia/Shanghai',
  locale: 'zh-CN',
  platform: 'windows',
  browserVersion: '',
  screenWidth: 1920,
  screenHeight: 1080,
  hardwareConcurrency: 8,
  deviceMemory: 8,
  storageQuotaMb: 5000,
  startUrl: 'https://example.com'
}

function formatTime(value: number | null): string {
  if (!value) return '-'
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(value)
}

export { formatTime }

export function useProfiles() {
  const [profiles, setProfiles] = useState<BrowserProfile[]>([])
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<'all' | ProfileStatus>('all')
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [serviceOnline, setServiceOnline] = useState(false)
  const [installedBrowserVersions, setInstalledBrowserVersions] = useState<string[]>([])
  const [page, setPage] = useState(1)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<BrowserProfile | null>(null)
  const [saving, setSaving] = useState(false)
  const [formValues, setFormValues] = useState<ProfileInput>(defaultForm)
  const [nameError, setNameError] = useState<string | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<BrowserProfile | null>(null)
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false)

  const refreshProfiles = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const list = silent
        ? await profileApi.list()
        : (await Promise.all([profileApi.list(), profileApi.health()]))[0]
      setProfiles(list)
      setServiceOnline(true)
    } catch {
      if (!silent) setProfiles([])
      setServiceOnline(false)
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    let firstRefresh = true
    return startProfilePolling(() => {
      const silent = !firstRefresh
      firstRefresh = false
      return refreshProfiles(silent)
    }, PROFILE_STATUS_POLL_INTERVAL_MS)
  }, [refreshProfiles])

  useEffect(() => {
    const refreshInstalledBrowserVersions = async () => {
      try {
        setInstalledBrowserVersions(await window.kernelReleases.installedVersions())
      } catch {
        setInstalledBrowserVersions([])
      }
    }

    refreshInstalledBrowserVersions()
    window.addEventListener('focus', refreshInstalledBrowserVersions)
    return () => window.removeEventListener('focus', refreshInstalledBrowserVersions)
  }, [])

  const filteredProfiles = useMemo(() => {
    return profiles.filter((item) => {
      const matchesTab = tab === 'all' || item.status === tab
      const text =
        `${item.name} ${item.proxy} ${item.timezone} ${item.locale} ${item.browserVersion}`.toLowerCase()
      return matchesTab && text.includes(query.toLowerCase())
    })
  }, [profiles, query, tab])

  const counts = useMemo(
    () => ({
      all: profiles.length,
      running: profiles.filter((item) => item.status === 'running').length,
      stopped: profiles.filter((item) => item.status === 'stopped').length
    }),
    [profiles]
  )

  const totalPages = Math.max(1, Math.ceil(filteredProfiles.length / PAGE_SIZE))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const pagedProfiles = filteredProfiles.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  useEffect(() => {
    setPage(1)
  }, [tab, query])

  const openCreate = () => {
    setEditing(null)
    setFormValues({
      ...defaultForm,
      browserVersion: installedBrowserVersions[0] ?? ''
    })
    setNameError(null)
    setModalOpen(true)
  }

  const openEdit = (profile: BrowserProfile) => {
    setEditing(profile)
    setFormValues({
      ...profile,
      browserVersion: installedBrowserVersions.includes(profile.browserVersion)
        ? profile.browserVersion
        : installedBrowserVersions[0] ?? ''
    })
    setNameError(null)
    setModalOpen(true)
  }

  const gotoPage = (n: number) => setPage(Math.min(Math.max(1, n), totalPages))

  const save = async () => {
    if (!formValues.name?.trim()) {
      setNameError('请输入环境名称')
      return
    }
    if (!formValues.browserVersion) {
      toast.warning(
        installedBrowserVersions.length
          ? '请选择浏览器版本'
          : '未下载任何浏览器内核，请先前往内核下载页面'
      )
      return
    }
    setNameError(null)
    setSaving(true)
    try {
      if (editing) {
        await profileApi.update(editing.id, formValues)
        toast.success('环境已更新')
      } else {
        await profileApi.create(formValues)
        toast.success('环境已创建')
      }
      setModalOpen(false)
      await refreshProfiles()
    } catch (error) {
      if (!serviceOnline) {
        toast.warning('当前为设计预览模式，请在 Electron 中保存真实数据')
      } else {
        toast.error(error instanceof Error ? error.message : '保存失败')
      }
    } finally {
      setSaving(false)
    }
  }

  const openProfile = async (id: string) => {
    if (!serviceOnline) {
      setProfiles((items) =>
        items.map((item) => (item.id === id ? { ...item, status: 'running' } : item))
      )
      toast.success('预览模式：环境已标记为运行中')
      return
    }
    const tid = toast.loading('正在打开浏览器环境...')
    try {
      await profileApi.open(id)
      await refreshProfiles()
      toast.success('浏览器已打开', { id: tid })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '打开失败', { id: tid })
    }
  }

  const closeProfile = async (id: string) => {
    if (!serviceOnline) {
      setProfiles((items) =>
        items.map((item) => (item.id === id ? { ...item, status: 'stopped' } : item))
      )
      toast.success('预览模式：环境已标记为已停止')
      return
    }
    await profileApi.close(id)
    await refreshProfiles()
    toast.success('环境已关闭')
  }

  const requestDelete = (profile: BrowserProfile) => setDeleteTarget(profile)
  const cancelDelete = () => setDeleteTarget(null)
  const confirmDelete = async () => {
    if (!deleteTarget) return
    const target = deleteTarget
    setDeleteTarget(null)
    if (!serviceOnline) {
      setProfiles((items) => items.filter((item) => item.id !== target.id))
      setSelectedKeys((keys) => keys.filter((id) => id !== target.id))
      return
    }
    try {
      await profileApi.remove(target.id)
      setSelectedKeys((keys) => keys.filter((id) => id !== target.id))
      await refreshProfiles()
      toast.success('环境及本地数据已删除')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败')
    }
  }

  const requestBatchDelete = () => {
    if (selectedKeys.length > 0) setBatchDeleteOpen(true)
  }

  const cancelBatchDelete = () => setBatchDeleteOpen(false)

  const confirmBatchDelete = async () => {
    if (selectedKeys.length === 0) return
    const ids = [...selectedKeys]
    setBatchDeleteOpen(false)

    if (!serviceOnline) {
      setProfiles((items) => items.filter((item) => !ids.includes(item.id)))
      setSelectedKeys([])
      toast.success(`已删除 ${ids.length} 个环境`)
      return
    }

    try {
      await profileApi.batchDelete(ids)
      setSelectedKeys([])
      await refreshProfiles()
      toast.success(`已删除 ${ids.length} 个环境及其本地数据`)
    } catch (error) {
      await refreshProfiles()
      toast.error(error instanceof Error ? error.message : '批量删除失败')
    }
  }

  const batchSetStatus = async (status: ProfileStatus) => {
    if (!selectedKeys.length) return
    if (!serviceOnline) {
      setProfiles((items) =>
        items.map((item) =>
          selectedKeys.includes(item.id) ? { ...item, status } : item
        )
      )
      toast.success(status === 'running' ? '已批量启动' : '已批量停止')
      return
    }
    const tasks = selectedKeys.map((id) =>
      status === 'running' ? profileApi.open(id) : profileApi.close(id)
    )
    await Promise.allSettled(tasks)
    await refreshProfiles()
    toast.success(status === 'running' ? '批量启动完成' : '批量停止完成')
  }

  return {
    profiles,
    loading,
    serviceOnline,
    installedBrowserVersions,
    query,
    setQuery,
    tab,
    setTab,
    counts,
    selectedKeys,
    setSelectedKeys,
    currentPage,
    totalPages,
    pageSize: PAGE_SIZE,
    pagedProfiles,
    allFilteredIds: filteredProfiles.map((p) => p.id),
    modalOpen,
    setModalOpen,
    editing,
    formValues,
    setFormValues,
    saving,
    nameError,
    openCreate,
    openEdit,
    save,
    gotoPage,
    deleteTarget,
    batchDeleteOpen,
    requestDelete,
    confirmDelete,
    cancelDelete,
    requestBatchDelete,
    confirmBatchDelete,
    cancelBatchDelete,
    openProfile,
    closeProfile,
    batchSetStatus
  }
}

export type ProfilesStore = ReturnType<typeof useProfiles>

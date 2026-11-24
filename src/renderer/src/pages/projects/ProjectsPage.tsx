import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Archive,
  ArrowDownUp,
  CircleCheck,
  Copy,
  FolderClosed,
  FolderSearch,
  ListFilter,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  X
} from 'lucide-react'
import { Page, PageContent, Toolbar, ToolbarSeparator } from '@/layout'
import { cn } from '@/lib/cn'
import { isMac, isModKey, modKey } from '@/lib/platform'
import {
  Badge,
  Button,
  ConfirmDialog,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  EmptyState,
  FormRow,
  IconButton,
  Input,
  Kbd,
  List,
  ListItem,
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
  Notice,
  Section,
  StatusDot
} from '@/ui'
import {
  formatDate,
  formatRelative,
  sampleProjects,
  statusLabel,
  statusTone,
  type Project,
  type ProjectStatus
} from './data'
import { ProjectDialog, type ProjectDraft } from './ProjectDialog'

type SortKey = 'updated' | 'name' | 'created'
const allStatuses = Object.keys(statusLabel) as ProjectStatus[]
const deleteKeyLabel = isMac ? '⌫' : 'Del'

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(sampleProjects)
  const [selectedId, setSelectedId] = useState<string | null>(sampleProjects[0]?.id ?? null)
  const [query, setQuery] = useState('')
  const [statuses, setStatuses] = useState<ProjectStatus[]>(['active', 'paused'])
  const [sort, setSort] = useState<SortKey>('updated')
  const [dialog, setDialog] = useState<{ mode: 'create' } | { mode: 'edit'; id: string } | null>(
    null
  )
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null)
  const [lastDeleted, setLastDeleted] = useState<{
    project: Project
    index: number
    wasSelected: boolean
  } | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return projects
      .filter((p) => statuses.includes(p.status))
      .filter((p) => !q || `${p.name} ${p.description} ${p.owner}`.toLowerCase().includes(q))
      .sort((a, b) => {
        if (sort === 'name') return a.name.localeCompare(b.name, 'zh-CN')
        if (sort === 'created') return b.createdAt.localeCompare(a.createdAt)
        return b.updatedAt.localeCompare(a.updatedAt)
      })
  }, [projects, query, statuses, sort])

  const selected = projects.find((p) => p.id === selectedId) ?? null
  const filtersActive = statuses.length !== allStatuses.length

  // ⌘F focuses search, ⌘N creates a project.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isModKey(event) || event.altKey || event.shiftKey) return
      const key = event.key.toLowerCase()
      if (key === 'f') {
        event.preventDefault()
        searchRef.current?.focus()
        searchRef.current?.select()
      } else if (key === 'n') {
        event.preventDefault()
        setDialog({ mode: 'create' })
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const update = (id: string, patch: Partial<Project>) =>
    setProjects((list) =>
      list.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p))
    )

  const create = (draft: ProjectDraft) => {
    const now = new Date().toISOString()
    const project: Project = {
      ...draft,
      id: crypto.randomUUID(),
      owner: '我',
      createdAt: now,
      updatedAt: now
    }
    setProjects((list) => [project, ...list])
    if (!statuses.includes(project.status)) setStatuses((s) => [...s, project.status])
    setSelectedId(project.id)
  }

  const duplicate = (project: Project) => {
    const now = new Date().toISOString()
    const copy = {
      ...project,
      id: crypto.randomUUID(),
      name: `${project.name} 副本`,
      createdAt: now,
      updatedAt: now
    }
    setProjects((list) => [copy, ...list])
    setSelectedId(copy.id)
  }

  const remove = (project: Project) => {
    const index = visible.findIndex((p) => p.id === project.id)
    const neighbour = visible[index + 1] ?? visible[index - 1] ?? null
    setLastDeleted({
      project,
      index: projects.findIndex((p) => p.id === project.id),
      wasSelected: selectedId === project.id
    })
    setProjects((list) => list.filter((p) => p.id !== project.id))
    if (selectedId === project.id) setSelectedId(neighbour?.id ?? null)
  }

  const undoRemove = () => {
    if (!lastDeleted) return
    const { project, index, wasSelected } = lastDeleted
    setProjects((list) => [...list.slice(0, index), project, ...list.slice(index)])
    if (wasSelected) setSelectedId(project.id)
    setLastDeleted(null)
  }

  const editing = dialog?.mode === 'edit' ? projects.find((p) => p.id === dialog.id) : undefined

  return (
    <Page>
      <Toolbar title="项目" subtitle={`${visible.length} 个`}>
        <Input
          ref={searchRef}
          type="search"
          aria-label="搜索项目"
          placeholder="搜索"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && query) {
              event.stopPropagation()
              setQuery('')
            }
          }}
          leading={<Search />}
          trailing={
            query ? (
              <button
                type="button"
                aria-label="清除搜索"
                onClick={() => setQuery('')}
                className="flex size-4 items-center justify-center rounded-full text-fg-subtle outline-none hover:text-fg focus-visible:focus-ring"
              >
                <X className="size-3" />
              </button>
            ) : (
              <Kbd>{modKey}F</Kbd>
            )
          }
          wrapperClassName="w-56 [&_input::-webkit-search-cancel-button]:hidden"
        />
        <Menu>
          <MenuTrigger asChild>
            <IconButton
              label="筛选"
              icon={<ListFilter />}
              className={cn(filtersActive && 'text-accent-text')}
            />
          </MenuTrigger>
          <MenuContent align="end">
            <MenuLabel>状态</MenuLabel>
            {allStatuses.map((status) => (
              <MenuCheckboxItem
                key={status}
                checked={statuses.includes(status)}
                onSelect={(event) => event.preventDefault()}
                onCheckedChange={(checked) =>
                  setStatuses((list) =>
                    checked ? [...list, status] : list.filter((s) => s !== status)
                  )
                }
              >
                {statusLabel[status]}
              </MenuCheckboxItem>
            ))}
            <MenuSeparator />
            <MenuItem disabled={!filtersActive} onSelect={() => setStatuses(allStatuses)}>
              显示全部
            </MenuItem>
          </MenuContent>
        </Menu>
        <Menu>
          <MenuTrigger asChild>
            <IconButton label="排序" icon={<ArrowDownUp />} />
          </MenuTrigger>
          <MenuContent align="end">
            <MenuLabel>排序方式</MenuLabel>
            <MenuRadioGroup value={sort} onValueChange={(value) => setSort(value as SortKey)}>
              <MenuRadioItem value="updated">最近更新</MenuRadioItem>
              <MenuRadioItem value="created">创建时间</MenuRadioItem>
              <MenuRadioItem value="name">名称</MenuRadioItem>
            </MenuRadioGroup>
          </MenuContent>
        </Menu>
        <ToolbarSeparator />
        <Button variant="primary" onClick={() => setDialog({ mode: 'create' })}>
          <Plus />
          新建
        </Button>
      </Toolbar>

      {lastDeleted && (
        <Notice
          tone="success"
          icon={<CircleCheck />}
          onDismiss={() => setLastDeleted(null)}
          actions={
            <Button size="sm" variant="ghost" onClick={undoRemove}>
              撤销
            </Button>
          }
        >
          已删除“{lastDeleted.project.name}”。
        </Notice>
      )}

      <PageContent padded={false}>
        <div className="flex w-80 shrink-0 flex-col overflow-y-auto border-r border-border p-2">
          {visible.length > 0 ? (
            <List
              ref={listRef}
              aria-label="项目列表"
              value={selectedId}
              onValueChange={setSelectedId}
              onAction={(id) => setDialog({ mode: 'edit', id })}
              onKeyDown={(event) => {
                const target = projects.find((p) => p.id === selectedId)
                if (target && (event.key === 'Delete' || event.key === 'Backspace')) {
                  event.preventDefault()
                  setPendingDelete(target)
                }
              }}
            >
              {visible.map((project) => (
                <ContextMenu key={project.id}>
                  <ContextMenuTrigger asChild>
                    <ListItem
                      value={project.id}
                      leading={<FolderClosed />}
                      title={project.name}
                      description={project.description || '无说明'}
                      trailing={
                        <>
                          {formatRelative(project.updatedAt)}
                          <StatusDot tone={statusTone[project.status]} />
                        </>
                      }
                    />
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      icon={<Pencil />}
                      shortcut="↵"
                      onSelect={() => setDialog({ mode: 'edit', id: project.id })}
                    >
                      编辑…
                    </ContextMenuItem>
                    <ContextMenuItem icon={<Copy />} onSelect={() => duplicate(project)}>
                      创建副本
                    </ContextMenuItem>
                    <ContextMenuItem
                      icon={<Archive />}
                      disabled={project.status === 'archived'}
                      onSelect={() => update(project.id, { status: 'archived' })}
                    >
                      归档
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      danger
                      icon={<Trash2 />}
                      shortcut={deleteKeyLabel}
                      onSelect={() => setPendingDelete(project)}
                    >
                      删除…
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </List>
          ) : (
            <EmptyState
              icon={<FolderSearch />}
              title="没有匹配的项目"
              description="试试其他关键词，或调整筛选条件。"
              actions={
                <Button
                  size="sm"
                  onClick={() => {
                    setQuery('')
                    setStatuses(allStatuses)
                  }}
                >
                  清除筛选
                </Button>
              }
            />
          )}
        </div>

        <div className="min-w-0 flex-1 overflow-y-auto">
          {selected ? (
            <ProjectDetail
              project={selected}
              onEdit={() => setDialog({ mode: 'edit', id: selected.id })}
              onDuplicate={() => duplicate(selected)}
              onArchive={() => update(selected.id, { status: 'archived' })}
              onDelete={() => setPendingDelete(selected)}
            />
          ) : (
            <EmptyState
              icon={<FolderClosed />}
              title="未选择项目"
              description="从左侧列表中选择一个项目查看详情。"
            />
          )}
        </div>
      </PageContent>

      <ProjectDialog
        open={dialog !== null}
        onOpenChange={(open) => !open && setDialog(null)}
        initial={editing}
        onSubmit={(draft) => {
          if (dialog?.mode === 'edit') update(dialog.id, draft)
          else create(draft)
          setDialog(null)
        }}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`删除“${pendingDelete?.name ?? ''}”？`}
        description="删除后可在页面顶部的提示中撤销。"
        confirmLabel="删除"
        danger
        onConfirm={() => pendingDelete && remove(pendingDelete)}
        onCloseAutoFocus={(event) => {
          // The deleted row no longer exists; keep keyboard users in the list.
          const row = listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')
          if (row) {
            event.preventDefault()
            row.focus()
          }
        }}
      />
    </Page>
  )
}

interface ProjectDetailProps {
  project: Project
  onEdit: () => void
  onDuplicate: () => void
  onArchive: () => void
  onDelete: () => void
}

function ProjectDetail({ project, onEdit, onDuplicate, onArchive, onDelete }: ProjectDetailProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 p-page">
      <header className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h2 className="selectable truncate text-xl font-semibold">{project.name}</h2>
          <div className="flex items-center gap-2 text-sm text-fg-muted">
            <Badge tone={statusTone[project.status]}>{statusLabel[project.status]}</Badge>
            <span>更新于 {formatRelative(project.updatedAt)}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button onClick={onEdit}>
            <Pencil />
            编辑
          </Button>
          <Menu>
            <MenuTrigger asChild>
              <IconButton label="更多操作" icon={<MoreHorizontal />} />
            </MenuTrigger>
            <MenuContent align="end">
              <MenuItem icon={<Copy />} onSelect={onDuplicate}>
                创建副本
              </MenuItem>
              <MenuItem
                icon={<Archive />}
                disabled={project.status === 'archived'}
                onSelect={onArchive}
              >
                归档
              </MenuItem>
              <MenuSeparator />
              <MenuItem danger icon={<Trash2 />} shortcut={deleteKeyLabel} onSelect={onDelete}>
                删除…
              </MenuItem>
            </MenuContent>
          </Menu>
        </div>
      </header>

      <Section title="说明">
        <p className="selectable pt-3 text-base leading-relaxed text-fg-muted">
          {project.description || '暂无说明。'}
        </p>
      </Section>

      <Section title="信息" divided>
        <FormRow label="负责人">
          <span className="text-fg-muted">{project.owner}</span>
        </FormRow>
        <FormRow label="状态">
          <span className="flex items-center gap-2 text-fg-muted">
            <StatusDot tone={statusTone[project.status]} />
            {statusLabel[project.status]}
          </span>
        </FormRow>
        <FormRow label="创建时间">
          <span className="text-fg-muted tabular-nums">{formatDate(project.createdAt)}</span>
        </FormRow>
        <FormRow label="最近更新">
          <span className="text-fg-muted tabular-nums">{formatDate(project.updatedAt)}</span>
        </FormRow>
      </Section>
    </div>
  )
}

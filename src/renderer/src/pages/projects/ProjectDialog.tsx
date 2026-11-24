import { useState, type FormEvent } from 'react'
import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  Input,
  Select,
  Textarea
} from '@/ui'
import { statusLabel, type Project, type ProjectStatus } from './data'

export type ProjectDraft = Pick<Project, 'name' | 'description' | 'status'>

interface ProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Present when editing; absent when creating. */
  initial?: ProjectDraft
  onSubmit: (draft: ProjectDraft) => void
}

export function ProjectDialog({ open, onOpenChange, initial, onSubmit }: ProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        {/* Remount the form on every open so it starts from fresh values. */}
        {open && <ProjectForm initial={initial} onSubmit={onSubmit} />}
      </DialogContent>
    </Dialog>
  )
}

function ProjectForm({ initial, onSubmit }: Pick<ProjectDialogProps, 'initial' | 'onSubmit'>) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [status, setStatus] = useState<ProjectStatus>(initial?.status ?? 'active')
  const [error, setError] = useState<string>()
  const editing = Boolean(initial)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) {
      setError('请输入项目名称')
      return
    }
    onSubmit({ name: name.trim(), description: description.trim(), status })
  }

  return (
    <form onSubmit={submit} className="contents">
      <DialogHeader>
        <DialogTitle>{editing ? '编辑项目' : '新建项目'}</DialogTitle>
        <DialogDescription>
          {editing ? '修改项目的名称、说明和状态。' : '项目创建后可以随时修改。'}
        </DialogDescription>
      </DialogHeader>
      <DialogBody>
        <Field label="名称" error={error}>
          <Input
            autoFocus
            value={name}
            placeholder="例如：品牌官网改版"
            onChange={(event) => {
              setName(event.target.value)
              if (error) setError(undefined)
            }}
          />
        </Field>
        <Field label="说明" description="可选，显示在列表中。">
          <Textarea
            value={description}
            rows={3}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
        <Field label="状态">
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as ProjectStatus)}
            options={(Object.keys(statusLabel) as ProjectStatus[]).map((value) => ({
              value,
              label: statusLabel[value]
            }))}
            className="w-40"
          />
        </Field>
      </DialogBody>
      <DialogFooter>
        <DialogClose asChild>
          <Button>取消</Button>
        </DialogClose>
        <Button type="submit" variant="primary">
          {editing ? '保存' : '创建'}
        </Button>
      </DialogFooter>
    </form>
  )
}

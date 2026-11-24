import { FolderKanban } from 'lucide-react'
import { definePage } from '@/app/pages'
import { ProjectsPage } from './ProjectsPage'

export default definePage({
  id: 'projects',
  title: '项目',
  icon: FolderKanban,
  order: 10,
  component: ProjectsPage
})

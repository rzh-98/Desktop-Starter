export type ProjectStatus = 'active' | 'paused' | 'archived'

export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  owner: string
  createdAt: string
  updatedAt: string
}

export const statusLabel: Record<ProjectStatus, string> = {
  active: '进行中',
  paused: '已暂停',
  archived: '已归档'
}

export const statusTone = {
  active: 'success',
  paused: 'warning',
  archived: 'neutral'
} as const

const day = 24 * 60 * 60 * 1000
const ago = (ms: number) => new Date(Date.now() - ms).toISOString()

export const sampleProjects: Project[] = [
  ['品牌官网改版', '新版首页、定价页与文档入口的设计与实现。', 'active', '林晓', 0.02, 40],
  [
    '移动端离线同步',
    '在弱网环境下保证编辑记录不丢失，并在恢复连接后合并。',
    'active',
    '周宁',
    0.3,
    64
  ],
  ['年度用户调研', '整理 120 份访谈记录，输出关键发现与机会点。', 'paused', '陈思远', 2, 90],
  ['支付流程优化', '缩短结算步骤，接入新的发票服务。', 'active', '王一鸣', 1, 30],
  ['设计系统 v2', '统一颜色、字号与间距 token，补齐表单组件。', 'active', '林晓', 0.1, 120],
  ['旧版 API 下线', '迁移剩余调用方并发布弃用公告。', 'archived', '赵磊', 40, 200],
  ['客服知识库', '为常见问题撰写可检索的解答，并接入应用内帮助。', 'paused', '孙悦', 7, 75],
  ['数据看板', '为运营团队提供每日活跃、留存与转化指标。', 'active', '周宁', 3, 55],
  ['国际化', '支持英文与日文界面，抽取并管理文案。', 'active', '陈思远', 5, 140],
  ['性能基线', '建立启动时间与内存占用的持续监测。', 'archived', '王一鸣', 60, 300],
  ['新手引导', '首次启动的引导流程与示例数据。', 'paused', '孙悦', 12, 45],
  ['安全审计', '依赖升级、权限收敛与第三方渗透测试。', 'active', '赵磊', 0.8, 25]
].map(([name, description, status, owner, updated, created], index) => ({
  id: `p${index + 1}`,
  name: name as string,
  description: description as string,
  status: status as ProjectStatus,
  owner: owner as string,
  updatedAt: ago((updated as number) * day),
  createdAt: ago((created as number) * day)
}))

const relative = new Intl.RelativeTimeFormat('zh-CN', { numeric: 'auto' })
const absolute = new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' })

export function formatRelative(iso: string): string {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000
  const abs = Math.abs(diff)
  if (abs < 60) return '刚刚'
  if (abs < 3600) return relative.format(Math.round(diff / 60), 'minute')
  if (abs < 86400) return relative.format(Math.round(diff / 3600), 'hour')
  if (abs < 86400 * 30) return relative.format(Math.round(diff / 86400), 'day')
  return relative.format(Math.round(diff / (86400 * 30)), 'month')
}

export function formatDate(iso: string): string {
  return absolute.format(new Date(iso))
}

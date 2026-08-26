export type CapabilityTab = 'discovery' | 'plugins' | 'agents' | 'people' | 'organizations'

export interface PluginItem {
  id: string
  name: string
  nameZh: string
  description: string
  descriptionZh: string
  tags: string[]
  tagsZh: string[]
  features: string[]
  featuresZh: string[]
  category: string
  categoryZh: string
  developer: string
  usesCount: string
  rating: number
  isAdded?: boolean
  iconType: 'translate' | 'seo' | 'analytics' | 'image' | 'shipping' | 'crm' | 'custom'
}

export interface AgentItem {
  id: string
  name: string
  nameZh: string
  taskType: string
  taskTypeZh: string
  description: string
  descriptionZh: string
  canPerform: string[]
  canPerformZh: string[]
  category: string
  categoryZh: string
  createdBy: string
  usesCount: string
  isAdded?: boolean
  agentAvatar: string
  colorTheme: string
}

export interface PersonItem {
  id: string
  name: string
  role: string
  roleZh: string
  skills: string[]
  skillsZh: string[]
  rating: number
  projectsCount: number
  location: string
  locationZh: string
  category: string
  categoryZh: string
  avatar: string
  bio: string
  bioZh: string
  verified: boolean
  recentWork: { title: string; client: string; year: string }[]
}

export interface OrganizationItem {
  id: string
  name: string
  type: string
  typeZh: string
  skills: string[]
  skillsZh: string[]
  teamSize: string
  teamSizeZh: string
  projectCount: number
  serviceScope: string
  serviceScopeZh: string
  category: string
  categoryZh: string
  logo: string
  about: string
  aboutZh: string
  featuredCase: { title: string; impact: string; category: string }[]
}

export interface SearchRecommendationResult {
  people: PersonItem[]
  organizations: OrganizationItem[]
  agents: AgentItem[]
  plugins: PluginItem[]
}

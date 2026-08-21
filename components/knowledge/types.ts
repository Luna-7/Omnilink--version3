export type TopLevelKnowledgeTab = 'my-knowledge' | 'internal-research' | 'marketplace'

export type SystemBaseId = 'brand-business' | 'product-knowledge' | 'support-policy'

export type SourceType = 'pdf' | 'markdown' | 'docx' | 'url' | 'structured'

export type AccessVisibility = 'customer-facing' | 'internal-private'

export interface KnowledgeSource {
  id: string
  name: string
  type: SourceType
  size: string
  updatedAt: string
  visibility: AccessVisibility
  selected: boolean
  tokensCount?: number
  summary?: string
}

export interface KnowledgeCollaborator {
  id: string
  name: string
  avatarUrl?: string
  color?: string
}

export interface KnowledgeBaseItem {
  id: SystemBaseId | string
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  icon: string
  visibility: AccessVisibility
  sourceCount: number
  storageUsed: string
  lastSynced: string
  activeConnections: string[]
  sources: KnowledgeSource[]
  isSystem: boolean
  
  // Card Visual & Collaboration Metadata (matching reference design)
  priorityTag?: string
  priorityColor?: 'urgent' | 'moderate' | 'low' | 'onboarding' | 'intel' | 'rainbow'
  collaborators?: KnowledgeCollaborator[]
  statusBadge?: {
    text: string
    color: 'progress' | 'correction' | 'review' | 'pending' | 'synced'
  }
  commentsCount?: number
  attachmentsCount?: number
}

// Structured Knowledge Types
export interface BrandBusinessStructuredData {
  logoUrl?: string
  brandName: string
  storeDisplayName: string
  contactPerson: string
  email: string
  phone: string
  whatsapp: string
  address: string
  consultationUrl?: string
  socialChannels: Record<string, string | undefined> & {
    twitter?: string
    instagram?: string
    linkedin?: string
    facebook?: string
    youtube?: string
    tiktok?: string
    discord?: string
  }
  officialLinks: Record<string, string | undefined> & {
    website?: string
    documentation?: string
    blog?: string
    helpCenter?: string
  }
}

export type SourceProcessingStatus = 'ready' | 'processing' | 'failed' | 'uploading'

export interface KnowledgeFileSource {
  id: string
  name: string
  type: SourceType | 'xlsx' | 'json' | 'txt' | 'csv'
  size: string
  sizeBytes?: number
  updatedAt: string
  visibility: AccessVisibility
  status: SourceProcessingStatus
  progress?: number
  tokensCount?: number
  summary?: string
  errorMessage?: string
}

export interface KnowledgeProductBinding {
  id: string
  sourceId: string
  productId: string
  boundAt: string
  matchType: 'manual' | 'ai_suggested'
  confidence?: number
}

export interface AiSuggestedBindingMatch {
  id: string
  sourceId: string
  productId: string
  confidence: number
  reason: string
  reasonEn: string
  detectedKeywords: string[]
}

export interface ProductKnowledgeSupplementaryData {
  productStory: string
  usageScenarios: string
  careInstructions: string
  certificationNotes: string
  compatibilityMatrix: string
  additionalAiContext: string
}

export interface SupportPolicyStructuredData {
  faqs: Array<{ id: string; question: string; answer: string; category: string }>
  shipping: {
    processingTime: string
    standardDelivery: string
    expressDelivery: string
    freeShippingThreshold: string
    supportedCarriers: string
    internationalNotes: string
  }
  returns: {
    returnWindowDays: number
    conditions: string
    shippingFeeCoverage: 'merchant' | 'buyer' | 'split'
    refundSla: string
  }
  warranty: {
    coverageMonths: number
    terms: string
    claimProcedure: string
    exclusions: string
  }
  customerService: {
    operatingHours: string
    responseSla: string
    escalationEmail: string
    supportedLanguages: string[]
  }
}

export interface ChatCitation {
  id: string
  sourceId: string
  sourceName: string
  excerpt: string
  pageNumber?: number
  confidence: number
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'assistant'
  content: string
  timestamp: string
  citations?: ChatCitation[]
  modelUsed?: string
}

export interface MarketplacePackage {
  id: string
  title: string
  titleEn: string
  category: string
  categoryEn: string
  description: string
  descriptionEn: string
  pricingType: 'free' | 'premium' | 'locked' | 'coming-soon'
  priceDisplay?: string
  sourcesCount: number
  downloadsCount: number
  rating: number
  author: string
  tags: string[]
  badge?: string
}

export interface ResearchModel {
  id: string
  name: string
  provider: string
  badge: string
  description: string
  contextWindow: string
}

export type WorkType =
  | '产品设计'
  | '包装设计'
  | '摄影'
  | '插画'
  | '品牌素材'
  | '3D 模型'
  | '其他'

export type WorkStatus = 'verified' | 'reviewing' | 'pending' | 'protected'

export interface ProvenanceTimelineItem {
  id: string
  title: string
  actorOrDesc: string
  date: string
  status: 'completed' | 'current' | 'upcoming'
}

export interface AssociatedProduct {
  id: string
  name: string
  sku: string
  image: string
  status: 'published' | 'draft' | 'archived'
  price?: number
  category?: string
}

export interface AuthorizedMerchant {
  id: string
  name: string
  avatar?: string
  scope: string
  validity: string
  status: 'active' | 'pending' | 'revoked'
  authorizedDate?: string
}

export interface PlatformDetection {
  id: string
  storeName: string
  matchRate: number
  status: 'authorized' | 'unauthorized'
  timeAgo: string
  productThumbnail?: string
  matchedItemName?: string
}

export interface ProvenanceWork {
  id: string
  name: string
  subtitle?: string
  coverImage: string
  gallery?: string[]
  type: WorkType
  owner: string
  createdAt: string
  code: string
  status: WorkStatus
  description?: string
  reviewProgress?: {
    submitted: boolean
    originReviewed: boolean
    originalityReview: 'in_progress' | 'completed' | 'waiting'
    fingerprintGenerated: boolean
    platformProtected: boolean
    submissionDate: string
    priority: string
  }
  fingerprint: {
    algorithm: string
    hash: string
    fullHash: string
    status: string
    onChainRecorded: string
  }
  timeline: ProvenanceTimelineItem[]
  associatedProducts: AssociatedProduct[]
  authorizedMerchants: AuthorizedMerchant[]
  platformProtection: {
    status: 'protected' | 'pending'
    protectedProductCount: number
    matchRecordCount: number
    unauthorizedUsageCount: number
    recentDetections: PlatformDetection[]
  }
}

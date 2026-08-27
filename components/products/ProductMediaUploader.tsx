'use client'

import React, { useState, useRef, useCallback, useImperativeHandle, forwardRef } from 'react'
import { UploadCloud, X, CheckCircle, AlertCircle, Loader2, RefreshCw, Link2, Plus, Film, Play } from 'lucide-react'
import { uploadProductMedia } from '@/lib/product-media/upload-client'

export interface PendingImage {
  id: string
  assetId: string
  file: File
  previewUrl: string
  status: 'idle' | 'uploading' | 'retrying' | 'success' | 'error'
  retryInfo?: {
    attempt: number
    maxAttempts: number
    reason: string
  }
  errorMsg?: string
  uploadedUrl?: string
}

export interface ExistingAsset {
  id: string
  url: string
  asset_type?: string
}

export interface ProductMediaUploaderRef {
  uploadPendingFiles: (targetProductId: string) => Promise<{
    successCount: number
    failedCount: number
    errors: string[]
  }>
  hasPendingFiles: () => boolean
}

interface ProductMediaUploaderProps {
  productId?: string
  existingAssets?: ExistingAsset[]
  onFilesChange?: (files: File[]) => void
  onUploadSuccess?: () => void
  isZh?: boolean
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const ProductMediaUploader = forwardRef<ProductMediaUploaderRef, ProductMediaUploaderProps>(
  ({ productId, existingAssets = [], onFilesChange, onUploadSuccess, isZh = true }, ref) => {
    const [pendingFiles, setPendingFiles] = useState<PendingImage[]>([])
    const [existingList, setExistingList] = useState<ExistingAsset[]>(existingAssets)
    const [isDragging, setIsDragging] = useState(false)
    const [isUploadingDirect, setIsUploadingDirect] = useState(false)
    const [generalError, setGeneralError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // External URL support states
    const [urlInput, setUrlInput] = useState('')
    const [urlError, setUrlError] = useState<string | null>(null)
    const [isAddingUrl, setIsAddingUrl] = useState(false)

    const isVideoUrl = useCallback((url: string): boolean => {
      if (!url) return false
      const cleanUrl = url.split('?')[0].toLowerCase()
      return (
        cleanUrl.endsWith('.mp4') ||
        cleanUrl.endsWith('.webm') ||
        cleanUrl.endsWith('.ogg') ||
        cleanUrl.endsWith('.mov') ||
        cleanUrl.endsWith('.m4v') ||
        cleanUrl.endsWith('.avi') ||
        cleanUrl.endsWith('.mkv') ||
        url.toLowerCase().includes('video') ||
        url.toLowerCase().includes('embed')
      )
    }, [])

    const handleAddUrl = async () => {
      setUrlError(null)
      const trimmedUrl = urlInput.trim()
      if (!trimmedUrl) return

      if (!/^https?:\/\//i.test(trimmedUrl)) {
        setUrlError(isZh ? '请输入以 http:// 或 https:// 开头的有效链接' : 'Please enter a valid URL starting with http:// or https://')
        return
      }

      const isVideo = isVideoUrl(trimmedUrl)
      
      const isDemo = !productId || productId.startsWith('OMNI-') || productId.startsWith('temp-') || productId.startsWith('demo-')
      
      if (isDemo) {
        const newAsset: ExistingAsset = {
          id: 'external-' + crypto.randomUUID(),
          url: trimmedUrl,
          asset_type: isVideo ? 'video' : 'image'
        }
        setExistingList(prev => [...prev, newAsset])
        setUrlInput('')
        return
      }

      setIsAddingUrl(true)
      try {
        const res = await fetch('/api/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: productId,
            asset_type: isVideo ? 'video' : 'image',
            url: trimmedUrl,
            metadata: {
              media: {
                source_mime_type: isVideo ? 'video/mp4' : 'image/jpeg',
                is_external_url: true
              }
            }
          })
        })

        if (res.ok) {
          const data = await res.json()
          if (data.asset) {
            setExistingList(prev => [...prev, {
              id: data.asset.id,
              url: data.asset.url,
              asset_type: isVideo ? 'video' : 'image'
            }])
            setUrlInput('')
          } else {
            setUrlError(isZh ? '添加失败' : 'Failed to add asset')
          }
        } else {
          const errData = await res.json()
          setUrlError(errData.error || (isZh ? '添加链接失败' : 'Failed to save URL asset'))
        }
      } catch (err) {
        setUrlError(isZh ? '网络请求失败，请稍后重试' : 'Network error, please try again later')
      } finally {
        setIsAddingUrl(false)
      }
    }

    React.useEffect(() => {
      setExistingList(existingAssets)
    }, [existingAssets])

    const validateAndAddFiles = useCallback(
      (files: FileList | File[]) => {
        setGeneralError(null)
        const fileArray = Array.from(files)
        const validItems: PendingImage[] = []
        let errorReason = ''

        for (const file of fileArray) {
          if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            errorReason = isZh
              ? '仅支持 JPG、PNG、WebP 格式图片'
              : 'Only JPG, PNG, and WebP images are supported'
            continue
          }
          if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
            errorReason = isZh
              ? '单张图片大小不能超过 10MB'
              : 'Single image size must not exceed 10MB'
            continue
          }
          if (file.name.length > 180) {
            errorReason = isZh
              ? '文件名长度不能超过 180 个字符'
              : 'File name must not exceed 180 characters'
            continue
          }

          const assetId = crypto.randomUUID()

          validItems.push({
            id: assetId,
            assetId,
            file,
            previewUrl: URL.createObjectURL(file),
            status: 'idle',
          })
        }

        if (errorReason && validItems.length === 0) {
          setGeneralError(errorReason)
          return
        }

        setPendingFiles((prev) => {
          const updated = [...prev, ...validItems]
          if (onFilesChange) {
            onFilesChange(updated.map((item) => item.file))
          }
          return updated
        })
      },
      [isZh, onFilesChange]
    )

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        validateAndAddFiles(e.target.files)
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        validateAndAddFiles(e.dataTransfer.files)
      }
    }

    const removePendingFile = (id: string) => {
      setPendingFiles((prev) => {
        const target = prev.find((item) => item.id === id)
        if (target?.previewUrl) {
          URL.revokeObjectURL(target.previewUrl)
        }
        const updated = prev.filter((item) => item.id !== id)
        if (onFilesChange) {
          onFilesChange(updated.map((item) => item.file))
        }
        return updated
      })
    }

    const uploadSingleFile = async (item: PendingImage, targetProductId: string) => {
      const res = await uploadProductMedia(
        {
          productId: targetProductId,
          assetId: item.assetId,
          file: item.file,
        },
        {
          onRetry: ({ attempt, maxAttempts, reason }) => {
            setPendingFiles((prev) =>
              prev.map((f) =>
                f.id === item.id
                  ? {
                      ...f,
                      status: 'retrying',
                      retryInfo: { attempt, maxAttempts, reason },
                    }
                  : f
              )
            )
          },
        }
      )

      if (!res.success) {
        throw new Error(res.error || (isZh ? '上传文件失败' : 'Upload failed'))
      }

      return { asset: res.asset }
    }

    const uploadPendingFiles = useCallback(
      async (targetProductId: string) => {
        if (pendingFiles.length === 0) {
          return { successCount: 0, failedCount: 0, errors: [] }
        }

        let successCount = 0
        let failedCount = 0
        const errors: string[] = []

        for (const item of pendingFiles) {
          if (item.status === 'success') {
            successCount++
            continue
          }

          setPendingFiles((prev) =>
            prev.map((f) => (f.id === item.id ? { ...f, status: 'uploading' } : f))
          )

          try {
            const data = await uploadSingleFile(item, targetProductId)
            const assetData = data.asset as { url?: string } | undefined
            const uploadedUrl = assetData?.url

            successCount++
            setPendingFiles((prev) =>
              prev.map((f) =>
                f.id === item.id
                  ? { ...f, status: 'success', uploadedUrl, retryInfo: undefined }
                  : f
              )
            )
          } catch (err) {
            failedCount++
            const message =
              err instanceof Error
                ? err.message
                : isZh
                ? '网络连接失败，请检查网络后重试'
                : 'Network error, please check connection'
            errors.push(message)
            setPendingFiles((prev) =>
              prev.map((f) =>
                f.id === item.id
                  ? { ...f, status: 'error', errorMsg: message, retryInfo: undefined }
                  : f
              )
            )
          }
        }

        if (onUploadSuccess && successCount > 0) {
          onUploadSuccess()
        }

        return { successCount, failedCount, errors }
      },
      [pendingFiles, isZh, onUploadSuccess]
    )

    useImperativeHandle(
      ref,
      () => ({
        uploadPendingFiles,
        hasPendingFiles: () => pendingFiles.some((f) => f.status !== 'success'),
      }),
      [uploadPendingFiles, pendingFiles]
    )

    const handleDirectUploadClick = async () => {
      if (!productId) return
      setIsUploadingDirect(true)
      setGeneralError(null)
      await uploadPendingFiles(productId)
      setIsUploadingDirect(false)
    }

    return (
      <div className="space-y-4">
        {/* Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
              : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelect}
          />
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {isZh ? '点击选择图片 或 将图片拖拽至此处' : 'Click to select or drag images here'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {isZh
                ? '支持 JPG、PNG、WebP 格式，单张不超过 10MB'
                : 'Supports JPG, PNG, WebP up to 10MB per file'}
            </div>
          </div>
        </div>

        {/* URL Input and Live Preview Component */}
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-xl p-4 space-y-3.5">
          <div className="flex items-center gap-1.5">
            <Link2 size={14} className="text-[#024AD8]" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isZh ? '输入外部媒体链接 (支持图片与视频)' : 'Enter External Media URL (Supports Image & Video)'}
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value)
                setUrlError(null)
              }}
              placeholder={isZh ? '输入有效的图片或视频 https:// 链接...' : 'Enter valid image or video https:// URL...'}
              className="flex-1 min-w-0 px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[4px] text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#024AD8] focus:border-[#024AD8]"
            />
            <button
              type="button"
              onClick={handleAddUrl}
              disabled={isAddingUrl || !urlInput.trim()}
              className="px-3.5 py-1.5 text-xs font-bold rounded-[4px] bg-[#024AD8] hover:bg-[#003198] text-white disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 transition-colors inline-flex items-center gap-1 cursor-pointer"
              style={{ outlineOffset: '2px' }}
            >
              {isAddingUrl ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Plus className="w-3 h-3" />
              )}
              <span>{isZh ? '添加' : 'Add'}</span>
            </button>
          </div>

          {urlError && (
            <div className="text-[11px] text-red-600 flex items-center gap-1 mt-1">
              <AlertCircle size={12} className="flex-shrink-0" />
              <span>{urlError}</span>
            </div>
          )}

          {/* Real-time Interactive Live Preview */}
          {urlInput.trim() && /^https?:\/\//i.test(urlInput.trim()) && (
            <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg p-3 space-y-2 mt-2 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-1.5">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {isZh ? '实时媒体预览' : 'Live Media Preview'}
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  {isVideoUrl(urlInput.trim()) ? (
                    <>
                      <Film size={10} />
                      <span>{isZh ? '视频预览' : 'Video Preview'}</span>
                    </>
                  ) : (
                    <>
                      <Play size={10} />
                      <span>{isZh ? '图片预览' : 'Image Preview'}</span>
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-850 p-2 overflow-hidden min-h-[140px]">
                {isVideoUrl(urlInput.trim()) ? (
                  <video
                    src={urlInput.trim()}
                    controls
                    className="max-h-48 max-w-full rounded object-contain"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={urlInput.trim()}
                    alt={isZh ? '实时预览' : 'Live URL Preview'}
                    className="max-h-48 max-w-full rounded object-contain"
                    onError={() => {
                      setUrlError(isZh ? '媒体链接可能失效或不支持跨域加载' : 'Media URL could be invalid or restricted by CORS')
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {generalError && (
          <div className="flex items-center space-x-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-900">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Gallery */}
        {(existingList.length > 0 || pendingFiles.length > 0) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isZh ? '商品画廊' : 'Product Gallery'} ({existingList.length + pendingFiles.length})
              </span>

              {productId &&
                pendingFiles.some(
                  (f) => f.status === 'idle' || f.status === 'error'
                ) && (
                  <button
                    type="button"
                    onClick={handleDirectUploadClick}
                    disabled={isUploadingDirect}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#024AD8] hover:bg-[#003198] text-white disabled:opacity-50 transition-colors"
                  >
                    {isUploadingDirect ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{isZh ? '正在处理上传...' : 'Processing upload...'}</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{isZh ? '开始上传新图片' : 'Upload New Images'}</span>
                      </>
                    )}
                  </button>
                )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {/* Existing Uploaded Assets */}
              {existingList.map((asset) => {
                const isVideo = asset.asset_type === 'video' || isVideoUrl(asset.url)
                return (
                  <div
                    key={asset.id}
                    className="group relative rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden aspect-square shadow-sm"
                  >
                    {isVideo ? (
                      <video
                        src={asset.url}
                        className="w-full h-full object-cover"
                        controls={false}
                        autoPlay={false}
                        muted
                        playsInline
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={asset.url}
                        alt={isZh ? '商品素材' : 'Product Asset'}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-1.5 left-1.5 bg-emerald-500/90 text-white text-[10px] font-medium px-1.5 py-0.5 rounded shadow-sm flex items-center space-x-1">
                      {isVideo ? <Film className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                      <span>{isVideo ? (isZh ? '公开视频' : 'Video') : (isZh ? '公开图像' : 'Image')}</span>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setExistingList(prev => prev.filter(item => item.id !== asset.id))
                      }}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/65 hover:bg-red-600 text-white transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                      title={isZh ? '移除资产' : 'Remove Asset'}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )
              })}

              {/* Pending Local Uploads */}
              {pendingFiles.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden aspect-square shadow-sm"
                >
                  <img
                    src={item.uploadedUrl || item.previewUrl}
                    alt={item.file.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Status Overlay Badges */}
                  <div className="absolute top-1.5 left-1.5 right-1.5 flex flex-col gap-1 items-start">
                    {item.status === 'uploading' && (
                      <span className="bg-[#024AD8]/95 text-white text-[10px] font-medium px-1.5 py-0.5 rounded shadow-sm flex items-center space-x-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>{isZh ? '上传中...' : 'Uploading...'}</span>
                      </span>
                    )}
                    {item.status === 'retrying' && item.retryInfo && (
                      <span className="bg-amber-600/95 text-white text-[10px] font-medium px-1.5 py-0.5 rounded shadow-sm flex items-center space-x-1">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>
                          {isZh
                            ? `正在重试 (${item.retryInfo.attempt}/${item.retryInfo.maxAttempts})`
                            : `Retrying (${item.retryInfo.attempt}/${item.retryInfo.maxAttempts})`}
                        </span>
                      </span>
                    )}
                    {item.status === 'success' && (
                      <span className="bg-emerald-500/95 text-white text-[10px] font-medium px-1.5 py-0.5 rounded shadow-sm flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>{isZh ? '已完成' : 'Uploaded'}</span>
                      </span>
                    )}
                    {item.status === 'idle' && (
                      <span className="bg-amber-500/90 text-white text-[10px] font-medium px-1.5 py-0.5 rounded shadow-sm">
                        {isZh ? '待提交' : 'Pending'}
                      </span>
                    )}
                    {item.status === 'error' && (
                      <span className="bg-red-600/95 text-white text-[10px] font-medium px-1.5 py-0.5 rounded shadow-sm flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{isZh ? '上传失败' : 'Failed'}</span>
                      </span>
                    )}
                  </div>

                  {/* Remove Button */}
                  {item.status !== 'uploading' && item.status !== 'retrying' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removePendingFile(item.id)
                      }}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white transition-colors"
                      title={isZh ? '移除文件' : 'Remove File'}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Error Text Overlay */}
                  {item.status === 'error' && item.errorMsg && (
                    <div className="absolute inset-x-0 bottom-0 bg-red-950/90 text-red-200 text-[10px] p-1.5 text-center leading-tight">
                      {item.errorMsg}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
)

ProductMediaUploader.displayName = 'ProductMediaUploader'

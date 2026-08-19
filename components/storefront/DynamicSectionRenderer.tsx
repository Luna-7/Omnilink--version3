/**
 * DynamicSectionRenderer — StorefrontSchema → React UI 的共享渲染器。
 *
 * 使用方（同一份渲染逻辑，禁止分叉）：
 *   1. StorefrontEditor 的 Live Preview（Client）
 *   2. app/store/[store_slug] 公开店面（Server）
 *
 * 因此本文件刻意不加 'use client'：无 hooks、无浏览器 API，
 * Server / Client 组件均可直接消费。
 *
 * 视觉约束：一律消费 var(--th-*) 主题令牌（由 ThemeRoot 作用域 +
 * storefrontThemeOverrides 内联覆盖提供），禁止硬编码颜色/圆角。
 *
 * 数据约束：featured_products 渲染真实 StorefrontProduct（复用 Theme System
 * 核心 ProductCard），无数据时显示空态，绝不渲染 demo 商品。
 */

import Link from 'next/link'
import type { StorefrontSection, GlobalStoreInfo, StoreContactConfig, StoreSocialConfig } from '@/lib/storefront/schema'
import type { StorefrontProduct } from '@/lib/storefront/types'
import ProductCard from '@/components/theme/core/ProductCard'
import NavbarCartButton from '@/components/cart/NavbarCartButton'
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Globe,
  Share2,
} from 'lucide-react'

interface DynamicSectionRendererProps {
  section: StorefrontSection
  storeSlug?: string
  /** 真实商品（白名单 DTO）。featured_products 使用；其它 section 忽略。 */
  products?: StorefrontProduct[]
  /** 全局店铺及联系方式信息 */
  globalInfo?: GlobalStoreInfo
  contact?: StoreContactConfig
  social?: StoreSocialConfig
}

export default function DynamicSectionRenderer({
  section,
  storeSlug,
  products = [],
  globalInfo,
  contact,
  social,
}: DynamicSectionRendererProps) {
  const { type, content, style, visible } = section

  if (!visible) return null

  const paddingClass = getPaddingClass(style?.padding)
  const bgClass = getBgClass(style?.bgStyle)

  const activeContact = contact || globalInfo?.contact
  const activeSocial = social || globalInfo?.social

  switch (type) {
    case 'header':
      return <HeaderSection content={content} storeSlug={storeSlug} contact={activeContact} />
    case 'hero':
      return (
        <section className={`${paddingClass} ${bgClass}`}>
          <HeroSection content={content} style={style} />
        </section>
      )
    case 'featured_products':
      return (
        <section className={`${paddingClass} ${bgClass}`}>
          <ProductGridSection content={content} products={products} />
        </section>
      )
    case 'collection':
      return (
        <section className={`${paddingClass} ${bgClass}`}>
          <CollectionSection content={content} style={style} />
        </section>
      )
    case 'image_text':
      return (
        <section className={`${paddingClass} ${bgClass}`}>
          <ImageTextSection content={content} style={style} />
        </section>
      )
    case 'rich_text':
      return (
        <section className={`${paddingClass} ${bgClass}`}>
          <RichTextSection content={content} style={style} />
        </section>
      )
    case 'cta':
      return (
        <section className={`${paddingClass} ${bgClass}`}>
          <CTASection content={content} contact={activeContact} />
        </section>
      )
    case 'footer':
      return <FooterSection content={content} contact={activeContact} social={activeSocial} />
    case 'testimonials':
      return (
        <section className={`${paddingClass} ${bgClass}`}>
          <TestimonialsSection content={content} />
        </section>
      )
    case 'faq':
      return (
        <section className={`${paddingClass} ${bgClass}`}>
          <FAQSection content={content} />
        </section>
      )
    default:
      return <UnsupportedSection type={type} />
  }
}

function getPaddingClass(padding?: string): string {
  switch (padding) {
    case 'compact':
      return 'py-8 sm:py-10'
    case 'spacious':
      return 'py-20 sm:py-28'
    case 'standard':
    default:
      return 'py-14 sm:py-20'
  }
}

function getBgClass(bgStyle?: string): string {
  switch (bgStyle) {
    case 'contrast':
      return 'bg-gray-900 text-white'
    case 'accent':
      return 'bg-[color-mix(in_srgb,var(--th-color-primary)_6%,transparent)] text-[var(--th-color-text)]'
    case 'glass':
      return 'bg-[var(--th-color-surface)]/80 backdrop-blur-md text-[var(--th-color-text)]'
    case 'default':
    default:
      return 'bg-[var(--th-color-background)] text-[var(--th-color-text)]'
  }
}

function getTextAlignClass(textAlign?: string): string {
  switch (textAlign) {
    case 'center':
      return 'text-center'
    case 'right':
      return 'text-right'
    case 'left':
    default:
      return 'text-left'
  }
}

/** 主题化基础按钮类（主按钮）。 */
const PRIMARY_BUTTON =
  'inline-block px-6 py-3 text-sm font-bold text-white bg-[var(--th-color-primary)] hover:bg-[var(--th-color-accent)] rounded-[var(--th-radius-button)] transition-colors [transition-duration:var(--th-motion-duration)] [transition-timing-function:var(--th-motion-easing)]'

/** 主题化次按钮类。 */
const SECONDARY_BUTTON =
  'inline-block px-6 py-3 text-sm font-bold border border-[var(--th-color-border)] text-[var(--th-color-text)] rounded-[var(--th-radius-button)] hover:bg-[var(--th-color-surface)] transition-colors [transition-duration:var(--th-motion-duration)]'

/** 主题化 tag chip。 */
const TAG_CHIP =
  'inline-block text-xs font-bold px-3.5 py-1.5 tracking-wider uppercase rounded-[var(--th-radius-input)] text-[var(--th-color-primary)] bg-[color-mix(in_srgb,var(--th-color-primary)_10%,transparent)]'

// Section Components

function HeaderSection({
  content,
  storeSlug,
  contact,
}: {
  content: StorefrontSection['content']
  storeSlug?: string
  contact?: StoreContactConfig
}) {
  return (
    <header className="sticky top-0 z-40 bg-[var(--th-color-background)]/95 backdrop-blur-md border-b border-[var(--th-color-border)]">
      {content.showAnnouncement && content.announcement && (
        <div className="bg-[var(--th-color-primary)] text-white text-xs font-bold py-2.5 px-5 text-center">
          {content.announcement}
        </div>
      )}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 h-16 sm:h-20 flex items-center justify-between">
        <Link href={`/store/${storeSlug || ''}`} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[var(--th-radius-card)] bg-[var(--th-color-primary)] text-white font-black flex items-center justify-center text-base">
            {(content.title || 'S').charAt(0).toUpperCase()}
          </div>
          <span className="[font-family:var(--th-font-heading)] font-extrabold text-lg sm:text-xl tracking-tight text-[var(--th-color-text)]">
            {content.title || 'Store'}
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[var(--th-color-muted)]">
            <Link href={`/store/${storeSlug || ''}`} className="hover:text-[var(--th-color-primary)]">
              Home
            </Link>
            <a href="#products" className="hover:text-[var(--th-color-primary)]">
              Products
            </a>
            {(contact?.contactUrl || contact?.email) && (
              <a
                href={contact.contactUrl || `mailto:${contact.email}`}
                className="hover:text-[var(--th-color-primary)]"
              >
                Contact
              </a>
            )}
          </nav>
          <NavbarCartButton />
        </div>
      </div>
    </header>
  )
}

function HeroSection({
  content,
  style,
}: {
  content: StorefrontSection['content']
  style?: StorefrontSection['style']
}) {
  const textAlignClass = getTextAlignClass(style?.textAlign)

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
      <div
        className={`grid gap-8 items-center ${
          content.imageUrl ? 'grid-cols-1 md:grid-cols-12' : 'grid-cols-1'
        }`}
      >
        <div
          className={`space-y-5 ${
            content.imageUrl ? 'md:col-span-7' : 'w-full'
          } ${textAlignClass}`}
        >
          {content.tag && <span className={TAG_CHIP}>{content.tag}</span>}
          <h1 className="[font-family:var(--th-font-heading)] [font-weight:var(--th-font-heading-weight)] text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight text-[var(--th-color-text)]">
            {content.title || 'Welcome'}
          </h1>
          {content.subtitle && (
            <p className="text-lg sm:text-xl font-medium text-[var(--th-color-text)]/80">
              {content.subtitle}
            </p>
          )}
          {content.description && (
            <p className="text-base sm:text-lg text-[var(--th-color-muted)] leading-relaxed max-w-xl">
              {content.description}
            </p>
          )}
          <div className="pt-3 flex flex-wrap items-center gap-3.5">
            {content.buttonText && (
              <Link href={content.buttonLink || '#'} className={PRIMARY_BUTTON}>
                {content.buttonText}
              </Link>
            )}
            {content.secondaryButtonText && (
              <Link href={content.secondaryButtonLink || '#'} className={SECONDARY_BUTTON}>
                {content.secondaryButtonText}
              </Link>
            )}
          </div>
        </div>
        {content.imageUrl && (
          <div className="md:col-span-5">
            <div className="aspect-16/10 overflow-hidden rounded-[var(--th-radius-card)] bg-[var(--th-color-surface)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.imageUrl}
                alt={content.title || 'Hero'}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const GRID_COLUMNS_CLASS: Record<number, string> = {
  2: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

function ProductGridSection({
  content,
  products,
}: {
  content: StorefrontSection['content']
  products: StorefrontProduct[]
}) {
  const columns =
    typeof content.columns === 'number' && GRID_COLUMNS_CLASS[content.columns]
      ? content.columns
      : 4
  const count =
    typeof content.count === 'number' && content.count > 0 ? content.count : 4
  const showPrice = content.showPrice !== false
  const visibleProducts = products.slice(0, count)

  return (
    <div id="products" className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
      {content.tag && (
        <span className="text-xs font-bold text-[var(--th-color-primary)] uppercase tracking-wider">
          {content.tag}
        </span>
      )}
      <h2 className="[font-family:var(--th-font-heading)] text-2xl sm:text-3xl font-bold tracking-tight mt-2 text-[var(--th-color-text)]">
        {content.title || 'Products'}
      </h2>
      {content.subtitle && (
        <p className="mt-2 text-sm text-[var(--th-color-muted)]">{content.subtitle}</p>
      )}
      {visibleProducts.length > 0 ? (
        <div
          className={`mt-8 grid ${GRID_COLUMNS_CLASS[columns] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'} gap-6`}
        >
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} showPrice={showPrice} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-[var(--th-radius-card)] border border-dashed border-[var(--th-color-border)] bg-[var(--th-color-surface)] p-10 text-center text-sm text-[var(--th-color-muted)]">
          No products yet
        </div>
      )}
    </div>
  )
}

function CollectionSection({
  content,
  style,
}: {
  content: StorefrontSection['content']
  style?: StorefrontSection['style']
}) {
  const imagePosition = content.imagePosition || 'right'
  const textAlignClass = getTextAlignClass(style?.textAlign)

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
      <div className="grid gap-6 items-center grid-cols-1 md:grid-cols-12">
        <div
          className={`space-y-3 ${
            imagePosition === 'left' ? 'md:col-span-6 md:order-2' : 'md:col-span-6'
          } ${textAlignClass}`}
        >
          {content.tag && (
            <span className="text-xs font-bold text-[var(--th-color-primary)] uppercase tracking-wider">
              {content.tag}
            </span>
          )}
          <h2 className="[font-family:var(--th-font-heading)] text-xl sm:text-2xl font-bold tracking-tight text-[var(--th-color-text)]">
            {content.title || 'Collection'}
          </h2>
          {content.subtitle && (
            <p className="text-base font-medium text-[var(--th-color-text)]/80">
              {content.subtitle}
            </p>
          )}
          {content.description && (
            <p className="text-sm text-[var(--th-color-muted)] leading-relaxed">
              {content.description}
            </p>
          )}
          {content.buttonText && (
            <Link href={content.buttonLink || '#'} className={PRIMARY_BUTTON}>
              {content.buttonText}
            </Link>
          )}
        </div>
        {content.imageUrl && (
          <div
            className={`md:col-span-6 ${
              imagePosition === 'left' ? 'md:order-1' : ''
            }`}
          >
            <div className="aspect-16/10 overflow-hidden rounded-[var(--th-radius-card)] bg-[var(--th-color-surface)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.imageUrl}
                alt={content.title || 'Collection'}
                className="w-full h-full object-cover object-top sm:object-[center_12%]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ImageTextSection({
  content,
  style,
}: {
  content: StorefrontSection['content']
  style?: StorefrontSection['style']
}) {
  // 与 Collection 同构，共用实现避免分叉
  return <CollectionSection content={content} style={style} />
}

function RichTextSection({
  content,
  style,
}: {
  content: StorefrontSection['content']
  style?: StorefrontSection['style']
}) {
  const textAlignClass = getTextAlignClass(style?.textAlign)
  return (
    <div className={`max-w-4xl mx-auto px-5 sm:px-8 lg:px-10 ${textAlignClass}`}>
      {content.tag && (
        <span className="text-xs font-bold text-[var(--th-color-primary)] uppercase tracking-wider">
          {content.tag}
        </span>
      )}
      <h2 className="[font-family:var(--th-font-heading)] text-2xl sm:text-3xl font-bold tracking-tight mt-2 text-[var(--th-color-text)]">
        {content.title || 'About Us'}
      </h2>
      {content.subtitle && (
        <p className="mt-2 text-base font-medium text-[var(--th-color-text)]/80">
          {content.subtitle}
        </p>
      )}
      {content.description && (
        <div className="mt-4 prose prose-sm max-w-none text-[var(--th-color-muted)]">
          <p>{content.description}</p>
        </div>
      )}
    </div>
  )
}

function CTASection({
  content,
  contact,
}: {
  content: StorefrontSection['content']
  style?: StorefrontSection['style']
  contact?: StoreContactConfig
}) {
  const targetLink = content.buttonLink && content.buttonLink !== '#' ? content.buttonLink : (contact?.contactUrl || '#products')

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-10">
      <div className="rounded-[var(--th-radius-card)] border border-[var(--th-color-border)] bg-[var(--th-color-surface)] p-10 sm:p-14 text-center shadow-[var(--th-shadow-card)]">
        {content.tag && <span className={TAG_CHIP}>{content.tag}</span>}
        <h2 className="[font-family:var(--th-font-heading)] [font-weight:var(--th-font-heading-weight)] text-2xl sm:text-3xl lg:text-4xl tracking-tight text-[var(--th-color-text)] mt-3">
          {content.title || 'Call to Action'}
        </h2>
        {content.subtitle && (
          <p className="text-base sm:text-lg text-[var(--th-color-text)]/80 font-medium mt-3 max-w-xl mx-auto">
            {content.subtitle}
          </p>
        )}
        {content.description && (
          <p className="text-sm sm:text-base text-[var(--th-color-muted)] max-w-xl mx-auto leading-relaxed mt-3">
            {content.description}
          </p>
        )}
        {content.buttonText && (
          <div className="mt-6">
            <Link
              href={targetLink}
              className={PRIMARY_BUTTON}
            >
              {content.buttonText}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function FooterSection({
  content,
  contact,
  social,
}: {
  content: StorefrontSection['content']
  style?: StorefrontSection['style']
  contact?: StoreContactConfig
  social?: StoreSocialConfig
}) {
  const trustBadges = [
    content.trustBadge1,
    content.trustBadge2,
    content.trustBadge3,
  ].filter((b): b is string => typeof b === 'string' && b.length > 0)
  const showTrustBadges = content.showTrustBadges !== false && trustBadges.length > 0
  const copyright =
    content.copyright || `© ${new Date().getFullYear()} ${content.title || 'Store'}. All rights reserved.`

  const hasContact = Boolean(
    contact && (contact.email || contact.phone || contact.whatsapp || contact.address)
  )

  const socialLinks = [
    { key: 'instagram', url: social?.instagram, icon: Share2, label: 'Instagram' },
    { key: 'facebook', url: social?.facebook, icon: Share2, label: 'Facebook' },
    { key: 'youtube', url: social?.youtube, icon: Share2, label: 'YouTube' },
    { key: 'tiktok', url: social?.tiktok, icon: Globe, label: 'TikTok' },
    { key: 'x', url: social?.x, icon: Share2, label: 'X' },
    { key: 'linkedin', url: social?.linkedin, icon: Share2, label: 'LinkedIn' },
  ].filter((item) => typeof item.url === 'string' && item.url.trim().length > 0)

  return (
    <footer className="bg-[var(--th-color-surface)] text-[var(--th-color-muted)] border-t border-[var(--th-color-border)] pt-14 pb-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto space-y-10">
        {showTrustBadges && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {trustBadges.map((badge, idx) => (
              <div
                key={idx}
                className="flex items-center justify-center gap-2 rounded-[var(--th-radius-card)] border border-[var(--th-color-border)] bg-[var(--th-color-background)]/50 px-4 py-3 text-xs font-semibold text-[var(--th-color-text)]"
              >
                <span className="text-[var(--th-color-primary)]">✓</span>
                <span>{badge}</span>
              </div>
            ))}
          </div>
        )}

        {(hasContact || socialLinks.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-[var(--th-color-border)] pt-8">
            {hasContact && (
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--th-color-primary)]">
                  Contact Us
                </div>
                <div className="space-y-2 text-xs sm:text-sm text-[var(--th-color-text)]/90">
                  {contact?.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 shrink-0 text-[var(--th-color-muted)]" />
                      <span>{contact.address}</span>
                    </div>
                  )}
                  {contact?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 shrink-0 text-[var(--th-color-muted)]" />
                      <a href={`mailto:${contact.email}`} className="hover:text-[var(--th-color-primary)] underline-offset-2 hover:underline">
                        {contact.email}
                      </a>
                    </div>
                  )}
                  {contact?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 shrink-0 text-[var(--th-color-muted)]" />
                      <a href={`tel:${contact.phone}`} className="hover:text-[var(--th-color-primary)]">
                        {contact.phone}
                      </a>
                    </div>
                  )}
                  {contact?.whatsapp && (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 shrink-0 text-emerald-500" />
                      <a
                        href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[var(--th-color-primary)]"
                      >
                        WhatsApp: {contact.whatsapp}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {socialLinks.length > 0 && (
              <div className="space-y-3 md:text-right">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--th-color-primary)]">
                  Connect
                </div>
                <div className="flex items-center gap-3 md:justify-end flex-wrap">
                  {socialLinks.map((item) => {
                    const IconComponent = item.icon
                    return (
                      <a
                        key={item.key}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.label}
                        className="w-9 h-9 rounded-full border border-[var(--th-color-border)] bg-[var(--th-color-background)] hover:bg-[var(--th-color-primary)] hover:text-white hover:border-[var(--th-color-primary)] flex items-center justify-center transition-all text-[var(--th-color-text)]"
                      >
                        <IconComponent className="w-4 h-4" />
                      </a>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs border-t border-[var(--th-color-border)] pt-8">
          <div className="flex items-center gap-3">
            <span className="[font-family:var(--th-font-heading)] font-bold text-[var(--th-color-text)] text-sm tracking-tight">
              {content.title || 'Store'}
            </span>
            <span>{copyright}</span>
          </div>
          <div className="text-[var(--th-color-muted)]">Powered by Omnilink Commerce Engine</div>
        </div>
      </div>
    </footer>
  )
}

function TestimonialsSection({
  content,
}: {
  content: StorefrontSection['content']
  style?: StorefrontSection['style']
}) {
  const testimonials = content.testimonialsList || []

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        {content.tag && (
          <span className="text-xs font-bold text-[var(--th-color-primary)] uppercase tracking-wider">
            {content.tag}
          </span>
        )}
        <h2 className="[font-family:var(--th-font-heading)] text-2xl sm:text-3xl font-bold tracking-tight text-[var(--th-color-text)]">
          {content.title || 'Testimonials'}
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((item, idx) => (
          <div
            key={idx}
            className="bg-[var(--th-color-surface)] rounded-[var(--th-radius-card)] p-6 border border-[var(--th-color-border)] shadow-[var(--th-shadow-card)]"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: item.rating || 5 }).map((_, s) => (
                  <span key={s}>★</span>
                ))}
              </div>
              <p className="text-sm text-[var(--th-color-text)] leading-relaxed">
                &ldquo;{item.quote}&rdquo;
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[var(--th-color-border)]">
              <div className="font-bold text-xs text-[var(--th-color-text)]">{item.name}</div>
              <div className="text-xs text-[var(--th-color-muted)]">{item.role}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FAQSection({
  content,
}: {
  content: StorefrontSection['content']
  style?: StorefrontSection['style']
}) {
  const faqs = content.faqList || []

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        {content.tag && (
          <span className="text-xs font-bold text-[var(--th-color-primary)] uppercase tracking-wider">
            {content.tag}
          </span>
        )}
        <h2 className="[font-family:var(--th-font-heading)] text-2xl sm:text-3xl font-bold tracking-tight text-[var(--th-color-text)]">
          {content.title || 'FAQ'}
        </h2>
      </div>
      <div className="space-y-3">
        {faqs.map((item, idx) => (
          <div
            key={idx}
            className="bg-[var(--th-color-surface)] rounded-[var(--th-radius-card)] border border-[var(--th-color-border)] overflow-hidden"
          >
            <div className="p-4 font-bold text-sm text-[var(--th-color-text)] flex items-center justify-between">
              <span>{item.question}</span>
              <span className="text-[var(--th-color-muted)]">▼</span>
            </div>
            <div className="p-4 pt-0 text-xs sm:text-sm text-[var(--th-color-muted)] border-t border-[var(--th-color-border)]">
              {item.answer}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function UnsupportedSection({ type }: { type: string }) {
  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-8">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
        <strong>Unsupported section type:</strong> {type}
      </div>
    </div>
  )
}

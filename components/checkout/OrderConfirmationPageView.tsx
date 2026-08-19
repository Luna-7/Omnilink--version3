'use client'

import React from 'react'
import Link from 'next/link'
import {
  CheckCircle,
  Clock,
  Mail,
  MessageCircle,
  Phone,
  ArrowRight,
  Printer,
  ShoppingBag,
  Building,
  MapPin,
  Calendar,
} from 'lucide-react'
import type {
  OrderConfirmationDTO,
  StorefrontStore,
} from '@/lib/storefront/types'

export default function OrderConfirmationPageView({
  order,
  store,
}: {
  order: OrderConfirmationDTO
  store: StorefrontStore
}) {
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  // Direct WhatsApp contact link
  const storePhone = store.contact?.whatsapp || store.contact?.phone || order.customer.whatsapp
  const whatsappUrl = storePhone
    ? `https://wa.me/${storePhone.replace(
        /[^0-9]/g,
        ''
      )}?text=${encodeURIComponent(
        `Hello ${store.name}, I am contacting you regarding my Inquiry #${order.orderNumber} for total ${order.currency} ${order.subtotal.toFixed(2)}.`
      )}`
    : null

  const storeEmail = store.contact?.email
  const emailUrl = storeEmail
    ? `mailto:${storeEmail}?subject=${encodeURIComponent(
        `Inquiry #${order.orderNumber} - ${order.customer.name}`
      )}&body=${encodeURIComponent(
        `Hello ${store.name} team,\n\nI recently submitted inquiry #${order.orderNumber}. Please let me know the next steps.\n\nThank you,\n${order.customer.name}`
      )}`
    : null

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
      {/* Top Banner */}
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4 ring-8 ring-emerald-500/5">
          <CheckCircle className="h-9 w-9" />
        </div>
        <h1 className="[font-family:var(--th-font-heading)] text-2xl sm:text-3xl [font-weight:var(--th-font-heading-weight)] text-[var(--th-color-text)]">
          Inquiry Successfully Placed
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[var(--th-color-muted)] max-w-lg mx-auto">
          Thank you, <strong className="text-[var(--th-color-text)]">{order.customer.name}</strong>. Your boutique inquiry has been dispatched to {store.name}.
        </p>

        {/* Order Reference Badge */}
        <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 rounded-[var(--th-radius-card)] border border-[var(--th-color-border)] bg-[var(--th-color-surface)] px-5 py-3 shadow-xs">
          <div className="text-left">
            <span className="block text-[10px] uppercase tracking-wider text-[var(--th-color-muted)]">
              Reference Number
            </span>
            <span className="[font-family:var(--th-font-heading)] text-sm font-bold text-[var(--th-color-text)]">
              {order.orderNumber}
            </span>
          </div>
          <div className="h-6 w-px bg-[var(--th-color-border)] hidden sm:block" />
          <div className="text-left">
            <span className="block text-[10px] uppercase tracking-wider text-[var(--th-color-muted)]">
              Status
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Clock className="h-3 w-3" />
              <span>Pending Merchant Review</span>
            </span>
          </div>
        </div>
      </div>

      {/* Direct Merchant Actions */}
      <div className="mt-10 rounded-[var(--th-radius-card)] border border-[var(--th-color-border)] bg-[var(--th-color-surface)] p-6 shadow-[var(--th-shadow-card)]">
        <h2 className="[font-family:var(--th-font-heading)] text-base font-semibold text-[var(--th-color-text)] mb-2">
          Next Steps & Priority Assistance
        </h2>
        <p className="text-xs text-[var(--th-color-muted)] mb-5">
          The merchant concierge team will review inventory availability and respond within 24 hours. For immediate attention, you may contact the store directly:
        </p>

        <div className="flex flex-wrap gap-3">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[var(--th-radius-button)] bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Chat via WhatsApp</span>
            </a>
          )}

          {emailUrl && (
            <a
              href={emailUrl}
              className="inline-flex items-center gap-2 rounded-[var(--th-radius-button)] border border-[var(--th-color-border)] bg-[var(--th-color-background)] px-4 py-2.5 text-xs font-medium text-[var(--th-color-text)] hover:bg-[var(--th-color-border)]/40 transition-colors"
            >
              <Mail className="h-4 w-4 text-[var(--th-color-primary)]" />
              <span>Email Store Concierge</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-[var(--th-radius-button)] border border-[var(--th-color-border)] bg-[var(--th-color-background)] px-4 py-2.5 text-xs font-medium text-[var(--th-color-muted)] hover:text-[var(--th-color-text)] hover:bg-[var(--th-color-border)]/40 transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>

      {/* Grid: Order Summary + Customer Info */}
      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Customer & Destination */}
        <div className="rounded-[var(--th-radius-card)] border border-[var(--th-color-border)] bg-[var(--th-color-surface)] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="[font-family:var(--th-font-heading)] text-sm font-semibold text-[var(--th-color-text)] pb-3 border-b border-[var(--th-color-border)] flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[var(--th-color-primary)]" />
              <span>Destination & Client Details</span>
            </h3>

            <dl className="mt-4 flex flex-col gap-2.5 text-xs">
              <div>
                <dt className="text-[10px] uppercase text-[var(--th-color-muted)]">Client Name</dt>
                <dd className="font-semibold text-[var(--th-color-text)] mt-0.5">{order.customer.name}</dd>
              </div>

              <div>
                <dt className="text-[10px] uppercase text-[var(--th-color-muted)]">Email</dt>
                <dd className="text-[var(--th-color-text)] mt-0.5">{order.customer.email}</dd>
              </div>

              {order.customer.phone && (
                <div>
                  <dt className="text-[10px] uppercase text-[var(--th-color-muted)]">Phone</dt>
                  <dd className="text-[var(--th-color-text)] mt-0.5">{order.customer.phone}</dd>
                </div>
              )}

              {order.customer.company && (
                <div>
                  <dt className="text-[10px] uppercase text-[var(--th-color-muted)]">Company</dt>
                  <dd className="text-[var(--th-color-text)] mt-0.5">{order.customer.company}</dd>
                </div>
              )}

              {(order.customer.address || order.customer.city || order.customer.country) && (
                <div>
                  <dt className="text-[10px] uppercase text-[var(--th-color-muted)]">Delivery Address</dt>
                  <dd className="text-[var(--th-color-text)] mt-0.5">
                    {[order.customer.address, order.customer.city, order.customer.state, order.customer.country]
                      .filter(Boolean)
                      .join(', ')}
                  </dd>
                </div>
              )}

              <div>
                <dt className="text-[10px] uppercase text-[var(--th-color-muted)]">Preferred Follow-up</dt>
                <dd className="capitalize text-[var(--th-color-text)] mt-0.5">
                  {order.customer.contactPreference || 'Email'}
                </dd>
              </div>
            </dl>
          </div>

          {order.customer.notes && (
            <div className="mt-4 pt-3 border-t border-[var(--th-color-border)]">
              <span className="text-[10px] uppercase text-[var(--th-color-muted)] block">Notes / Special Requests</span>
              <p className="mt-1 text-xs italic text-[var(--th-color-muted)]">
                &ldquo;{order.customer.notes}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Itemized Snapshot */}
        <div className="rounded-[var(--th-radius-card)] border border-[var(--th-color-border)] bg-[var(--th-color-surface)] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="[font-family:var(--th-font-heading)] text-sm font-semibold text-[var(--th-color-text)] pb-3 border-b border-[var(--th-color-border)] flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-[var(--th-color-primary)]" />
              <span>Requested Items ({order.items.length})</span>
            </h3>

            <div className="mt-4 divide-y divide-[var(--th-color-border)] max-h-64 overflow-y-auto pr-1">
              {order.items.map((it) => (
                <div key={it.id} className="py-2.5 first:pt-0 last:pb-0 flex justify-between items-start text-xs">
                  <div className="pr-3">
                    <span className="font-semibold text-[var(--th-color-text)] block">
                      {it.productName}
                    </span>
                    {it.selectedOptions && Object.keys(it.selectedOptions).length > 0 && (
                      <span className="text-[10px] text-[var(--th-color-muted)] block">
                        {Object.entries(it.selectedOptions)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(' · ')}
                      </span>
                    )}
                    <span className="text-[11px] text-[var(--th-color-muted)]">
                      Qty: {it.quantity} × {it.currency} {it.unitPrice.toFixed(2)}
                    </span>
                  </div>
                  <span className="font-bold text-[var(--th-color-text)] shrink-0">
                    {it.currency} {it.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--th-color-border)] flex justify-between items-baseline">
            <span className="text-xs font-semibold text-[var(--th-color-text)]">
              Estimated Total
            </span>
            <span className="[font-family:var(--th-font-heading)] text-lg font-bold text-[var(--th-color-primary)]">
              {order.currency} {order.subtotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Return to Store Navigation */}
      <div className="mt-12 text-center">
        <Link
          href={`/store/${store.slug}`}
          className="inline-flex items-center gap-2 rounded-[var(--th-radius-button)] bg-[var(--th-color-primary)] px-6 py-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[var(--th-color-accent)]"
        >
          <span>Return to Storefront</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </main>
  )
}

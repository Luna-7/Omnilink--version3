'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  Mail,
  MessageCircle,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import type { StorefrontStore } from '@/lib/storefront/types'
import { useCart } from '@/components/cart/CartContext'
import { submitOrderInquiryAction } from '@/app/actions/order'

export default function CheckoutPageView({ store }: { store: StorefrontStore }) {
  const router = useRouter()
  const { items, subtotal, currency, clearCart, isHydrated } = useCart()

  // Customer Form State
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [company, setCompany] = useState('')
  const [country, setCountry] = useState('United States')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [contactPreference, setContactPreference] = useState<'email' | 'whatsapp' | 'phone'>('email')

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isHydrated) {
    return (
      <main className="mx-auto max-w-[var(--th-spacing-container)] px-4 py-16 text-center">
        <div className="h-8 w-40 bg-[var(--th-color-border)]/50 rounded mx-auto animate-pulse" />
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-[var(--th-spacing-container)] px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--th-color-border)]/30 text-[var(--th-color-muted)] mb-4">
          <AlertCircle className="h-8 w-8 opacity-40" />
        </div>
        <h1 className="[font-family:var(--th-font-heading)] text-2xl [font-weight:var(--th-font-heading-weight)] text-[var(--th-color-text)]">
          Your Shopping Bag is Empty
        </h1>
        <p className="mt-2 text-xs text-[var(--th-color-muted)]">
          Please add items to your bag before proceeding to checkout.
        </p>
        <Link
          href={`/store/${store.slug}`}
          className="mt-6 inline-flex items-center gap-2 rounded-[var(--th-radius-button)] bg-[var(--th-color-primary)] px-6 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--th-color-accent)]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Store</span>
        </Link>
      </main>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!name.trim()) {
      setErrorMsg('Please provide your full name.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.')
      return
    }

    setIsSubmitting(true)

    try {
      // Security: pass ONLY identifiers and quantities. Server validates prices.
      const payloadItems = items.map((it) => ({
        productId: it.productId,
        variantId: it.variantId || null,
        quantity: it.quantity,
        selectedOptions: it.selectedOptions,
      }))

      const result = await submitOrderInquiryAction({
        storeSlug: store.slug,
        customer: {
          name,
          email,
          phone,
          whatsapp,
          company,
          country,
          state,
          city,
          address,
          notes,
          contactPreference,
        },
        items: payloadItems,
      })

      if (result.success && result.orderId) {
        clearCart()
        router.push(`/store/${store.slug}/order-confirmation/${result.orderId}`)
      } else {
        setErrorMsg(result.error || 'Failed to submit inquiry. Please try again.')
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'A network error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-[var(--th-spacing-container)] px-4 py-10 sm:py-16">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between border-b border-[var(--th-color-border)] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={`/store/${store.slug}/cart`}
              className="text-xs text-[var(--th-color-muted)] hover:text-[var(--th-color-text)] transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Bag</span>
            </Link>
          </div>
          <h1 className="[font-family:var(--th-font-heading)] text-2xl sm:text-3xl [font-weight:var(--th-font-heading-weight)] text-[var(--th-color-text)] mt-2">
            Checkout & Order Inquiry
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--th-color-muted)]">
          <Lock className="h-4 w-4 text-[var(--th-color-primary)]" />
          <span>Encrypted Inquiry Channel</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12 items-start">
          {/* Left Column: Customer & Shipping Form */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            {/* Error Message */}
            {errorMsg && (
              <div className="rounded-[var(--th-radius-input)] border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-600 dark:text-red-400 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Contact Information */}
            <div className="rounded-[var(--th-radius-card)] border border-[var(--th-color-border)] bg-[var(--th-color-surface)] p-6 shadow-[var(--th-shadow-card)]">
              <h2 className="[font-family:var(--th-font-heading)] text-base [font-weight:var(--th-font-heading-weight)] text-[var(--th-color-text)] mb-4 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--th-color-primary)] text-[10px] font-bold text-white">
                  1
                </span>
                <span>Contact Details</span>
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[var(--th-color-text)] mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full rounded-[var(--th-radius-input)] border border-[var(--th-color-border)] bg-[var(--th-color-background)] px-3.5 py-2.5 text-xs text-[var(--th-color-text)] placeholder-[var(--th-color-muted)]/60 focus:border-[var(--th-color-primary)] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[var(--th-color-text)] mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="eleanor@example.com"
                    className="w-full rounded-[var(--th-radius-input)] border border-[var(--th-color-border)] bg-[var(--th-color-background)] px-3.5 py-2.5 text-xs text-[var(--th-color-text)] placeholder-[var(--th-color-muted)]/60 focus:border-[var(--th-color-primary)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--th-color-text)] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-[var(--th-radius-input)] border border-[var(--th-color-border)] bg-[var(--th-color-background)] px-3.5 py-2.5 text-xs text-[var(--th-color-text)] placeholder-[var(--th-color-muted)]/60 focus:border-[var(--th-color-primary)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--th-color-text)] mb-1">
                    WhatsApp (Optional)
                  </label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-[var(--th-radius-input)] border border-[var(--th-color-border)] bg-[var(--th-color-background)] px-3.5 py-2.5 text-xs text-[var(--th-color-text)] placeholder-[var(--th-color-muted)]/60 focus:border-[var(--th-color-primary)] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[var(--th-color-text)] mb-1">
                    Company / Studio (Optional)
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Studio Vance Architecture"
                    className="w-full rounded-[var(--th-radius-input)] border border-[var(--th-color-border)] bg-[var(--th-color-background)] px-3.5 py-2.5 text-xs text-[var(--th-color-text)] placeholder-[var(--th-color-muted)]/60 focus:border-[var(--th-color-primary)] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Delivery & Address */}
            <div className="rounded-[var(--th-radius-card)] border border-[var(--th-color-border)] bg-[var(--th-color-surface)] p-6 shadow-[var(--th-shadow-card)]">
              <h2 className="[font-family:var(--th-font-heading)] text-base [font-weight:var(--th-font-heading-weight)] text-[var(--th-color-text)] mb-4 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--th-color-primary)] text-[10px] font-bold text-white">
                  2
                </span>
                <span>Destination & Instructions</span>
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[var(--th-color-text)] mb-1">
                    Country / Region
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-[var(--th-radius-input)] border border-[var(--th-color-border)] bg-[var(--th-color-background)] px-3.5 py-2.5 text-xs text-[var(--th-color-text)] focus:border-[var(--th-color-primary)] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[var(--th-color-text)] mb-1">
                    Street Address & Suite
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="742 Evergreen Terrace, Apt 4B"
                    className="w-full rounded-[var(--th-radius-input)] border border-[var(--th-color-border)] bg-[var(--th-color-background)] px-3.5 py-2.5 text-xs text-[var(--th-color-text)] placeholder-[var(--th-color-muted)]/60 focus:border-[var(--th-color-primary)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--th-color-text)] mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="San Francisco"
                    className="w-full rounded-[var(--th-radius-input)] border border-[var(--th-color-border)] bg-[var(--th-color-background)] px-3.5 py-2.5 text-xs text-[var(--th-color-text)] placeholder-[var(--th-color-muted)]/60 focus:border-[var(--th-color-primary)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--th-color-text)] mb-1">
                    State / Province / Postal Code
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="CA 94103"
                    className="w-full rounded-[var(--th-radius-input)] border border-[var(--th-color-border)] bg-[var(--th-color-background)] px-3.5 py-2.5 text-xs text-[var(--th-color-text)] placeholder-[var(--th-color-muted)]/60 focus:border-[var(--th-color-primary)] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[var(--th-color-text)] mb-1">
                    Order Notes / Special Requests (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any specific requests regarding bespoke fitting, gift packaging, or expedited shipping..."
                    className="w-full rounded-[var(--th-radius-input)] border border-[var(--th-color-border)] bg-[var(--th-color-background)] px-3.5 py-2 text-xs text-[var(--th-color-text)] placeholder-[var(--th-color-muted)]/60 focus:border-[var(--th-color-primary)] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Preferred Follow-up Method */}
            <div className="rounded-[var(--th-radius-card)] border border-[var(--th-color-border)] bg-[var(--th-color-surface)] p-6 shadow-[var(--th-shadow-card)]">
              <h2 className="[font-family:var(--th-font-heading)] text-base [font-weight:var(--th-font-heading-weight)] text-[var(--th-color-text)] mb-4 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--th-color-primary)] text-[10px] font-bold text-white">
                  3
                </span>
                <span>Preferred Confirmation Method</span>
              </h2>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setContactPreference('email')}
                  className={`flex flex-col items-center gap-2 rounded-[var(--th-radius-button)] border p-4 text-center transition-all ${
                    contactPreference === 'email'
                      ? 'border-[var(--th-color-primary)] bg-[var(--th-color-primary)]/10 text-[var(--th-color-text)] font-semibold'
                      : 'border-[var(--th-color-border)] bg-[var(--th-color-background)] text-[var(--th-color-muted)] hover:border-[var(--th-color-primary)]/40'
                  }`}
                >
                  <Mail className="h-5 w-5 text-[var(--th-color-primary)]" />
                  <span className="text-xs">Email Concierge</span>
                </button>

                <button
                  type="button"
                  onClick={() => setContactPreference('whatsapp')}
                  className={`flex flex-col items-center gap-2 rounded-[var(--th-radius-button)] border p-4 text-center transition-all ${
                    contactPreference === 'whatsapp'
                      ? 'border-emerald-600 bg-emerald-500/10 text-[var(--th-color-text)] font-semibold'
                      : 'border-[var(--th-color-border)] bg-[var(--th-color-background)] text-[var(--th-color-muted)] hover:border-emerald-500/40'
                  }`}
                >
                  <MessageCircle className="h-5 w-5 text-emerald-600" />
                  <span className="text-xs">WhatsApp Chat</span>
                </button>

                <button
                  type="button"
                  onClick={() => setContactPreference('phone')}
                  className={`flex flex-col items-center gap-2 rounded-[var(--th-radius-button)] border p-4 text-center transition-all ${
                    contactPreference === 'phone'
                      ? 'border-[var(--th-color-primary)] bg-[var(--th-color-primary)]/10 text-[var(--th-color-text)] font-semibold'
                      : 'border-[var(--th-color-border)] bg-[var(--th-color-background)] text-[var(--th-color-muted)] hover:border-[var(--th-color-primary)]/40'
                  }`}
                >
                  <Phone className="h-5 w-5 text-[var(--th-color-primary)]" />
                  <span className="text-xs">Direct Phone</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Order Review & Submit */}
          <div className="lg:col-span-5 rounded-[var(--th-radius-card)] border border-[var(--th-color-border)] bg-[var(--th-color-surface)] p-6 shadow-[var(--th-shadow-card)] sticky top-20">
            <h2 className="[font-family:var(--th-font-heading)] text-lg [font-weight:var(--th-font-heading-weight)] text-[var(--th-color-text)] pb-4 border-b border-[var(--th-color-border)]">
              Items in this Inquiry ({items.length})
            </h2>

            {/* List */}
            <div className="mt-4 max-h-72 overflow-y-auto divide-y divide-[var(--th-color-border)] pr-1">
              {items.map((it) => (
                <div key={it.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[var(--th-radius-input)] border border-[var(--th-color-border)] bg-[var(--th-color-background)]">
                    {it.image ? (
                      <Image
                        src={it.image}
                        alt={it.productName}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-[var(--th-color-muted)]">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-center min-w-0">
                    <p className="[font-family:var(--th-font-heading)] text-xs font-semibold text-[var(--th-color-text)] truncate">
                      {it.productName}
                    </p>
                    {it.selectedOptions && Object.keys(it.selectedOptions).length > 0 && (
                      <p className="text-[10px] text-[var(--th-color-muted)] truncate">
                        {Object.entries(it.selectedOptions)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(', ')}
                      </p>
                    )}
                    <p className="text-[11px] text-[var(--th-color-muted)] mt-0.5">
                      Qty: {it.quantity} × {currency} {it.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="self-center text-right">
                    <span className="text-xs font-bold text-[var(--th-color-text)]">
                      {currency} {(it.price * it.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Details */}
            <div className="mt-4 pt-4 border-t border-[var(--th-color-border)] flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between text-[var(--th-color-muted)]">
                <span>Subtotal</span>
                <span className="font-semibold text-[var(--th-color-text)]">
                  {currency} {subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-[var(--th-color-muted)]">
                <span>Shipping & Insurance</span>
                <span className="italic">Coordinated post-inquiry</span>
              </div>

              <div className="mt-2 pt-3 border-t border-[var(--th-color-border)] flex justify-between items-baseline">
                <span className="text-sm font-bold text-[var(--th-color-text)]">
                  Total Value
                </span>
                <span className="[font-family:var(--th-font-heading)] text-xl font-bold text-[var(--th-color-primary)]">
                  {currency} {subtotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Demo / Inquiry Notice */}
            <div className="mt-5 rounded-[var(--th-radius-input)] bg-[var(--th-color-background)] border border-[var(--th-color-border)] p-3 text-[11px] leading-relaxed text-[var(--th-color-muted)]">
              <p className="font-semibold text-[var(--th-color-text)] mb-1 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[var(--th-color-primary)]" />
                <span>Bespoke Order Process</span>
              </p>
              No online payment is charged now. Upon submission, the merchant will review availability and contact you via your selected channel with confirmation and payment instructions.
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-[var(--th-radius-button)] bg-[var(--th-color-primary)] py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[var(--th-color-accent)] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting Inquiry...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Submit Order Inquiry</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </main>
  )
}

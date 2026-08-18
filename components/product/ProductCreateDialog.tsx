'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

/**
 * ProductCreateDialog — minimal secondary entry point for product creation
 * (#60 P2 fix: surface real errors instead of silently reloading).
 *
 * The primary entry point is /dashboard/products/new which uses the
 * validated ProductForm. This dialog exists for shortcut UX and POSTs to
 * the same /api/merchant/products endpoint.
 *
 * NOTE: this dialog does not include price/inventory/sku because it lives
 * inside ProductTable's compact grid layout — clicking through to the full
 * form is the primary path when those fields are needed.
 */
export function ProductCreateDialog() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    images: [] as string[],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    setError('')
    if (!form.title.trim()) {
      setError('Product name is required')
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/merchant/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.title.trim(),
          description: form.description.trim() || null,
          price: 0,
          currency: 'USD',
          inventory: 0,
        }),
      })
      if (res.ok) {
        setOpen(false)
        window.location.reload()
        return
      }
      let message =
        res.status === 401
          ? 'Your session has expired. Please sign in again.'
          : res.status >= 500
            ? 'Server error. Please try again in a moment.'
            : 'Unable to create product. Please check the form and try again.'
      try {
        const body = await res.json()
        if (body?.error) message = `${message} (${body.error})`
      } catch {
        // ignore JSON parse errors; keep default message
      }
      setError(message)
    } catch (err) {
      setError(
        err instanceof Error
          ? `Network error: ${err.message}`
          : 'Network error while creating the product',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-primary-omni rounded-md border-0">
          添加产品
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>创建产品</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>产品名称</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label>产品描述</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label>分类</Label>
            <Input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          {error ? (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs"
            >
              {error}
            </div>
          ) : null}

          <Button
            onClick={submit}
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? '创建中…' : '创建'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

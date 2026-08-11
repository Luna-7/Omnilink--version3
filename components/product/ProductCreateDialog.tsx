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

export function ProductCreateDialog() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    images: [] as string[],
  })

  async function submit() {
    await fetch('/api/merchant/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    })

    window.location.reload()
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Product</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create AI Product</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <Label>Category</Label>
            <Input
              onChange={e => setForm({ ...form, category: e.target.value })}
            />
          </div>

          <Button onClick={submit} className="w-full">
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

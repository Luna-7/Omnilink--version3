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
        <Button className="btn-primary-omni rounded-md border-0">添加产品</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>创建产品</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>产品名称</Label>
            <Input
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <Label>产品描述</Label>
            <Textarea
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <Label>分类</Label>
            <Input
              onChange={e => setForm({ ...form, category: e.target.value })}
            />
          </div>

          <Button onClick={submit} className="w-full">
            创建
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

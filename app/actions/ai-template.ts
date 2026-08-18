'use server'

import { GoogleGenAI } from '@google/genai'
import { createClientServer } from '@/lib/supabase/server'
import type { StorefrontSchema } from '@/lib/storefront/schema'
import { createDefaultSchema, normalizeStorefrontSchema } from '@/lib/storefront/schema'
import { validateCanonicalTemplateSchema } from '@/lib/storefront/validator'

export interface GenerateTemplateInput {
  brandName: string
  brandPositioning?: string
  productCategory?: string
  targetAudience?: string
  visualDirection?: 'minimal' | 'glass' | 'diffuse' | 'tech'
  language?: 'zh' | 'en'
}

export async function generateAITemplateAction(input: GenerateTemplateInput): Promise<{
  success: boolean
  templateId?: string
  schema?: StorefrontSchema
  error?: string
}> {
  const {
    brandName,
    brandPositioning = 'High-end design-focused commerce',
    productCategory = 'Design & Lifestyle Goods',
    targetAudience = 'Discerning consumers',
    visualDirection = 'minimal',
    language = 'zh',
  } = input

  if (!brandName || !brandName.trim()) {
    return { success: false, error: 'Brand name is required' }
  }

  const isZh = language === 'zh'
  let generatedSchema: StorefrontSchema | null = null

  // 1. 调用 Gemini API 进行 Schema 结构化生成
  const apiKey = process.env.GEMINI_API_KEY
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey })
      const prompt = `
You are the Omnilink AI Template Factory engine.
Generate a valid, production-ready StorefrontSchema JSON object for an e-commerce storefront.

Brand Name: "${brandName}"
Brand Positioning: "${brandPositioning}"
Product Category: "${productCategory}"
Target Audience: "${targetAudience}"
Visual Direction Theme ID: "${visualDirection}" (Must be strictly one of: "minimal", "glass", "diffuse", "tech")
Language: "${isZh ? 'Chinese (zh)' : 'English (en)'}"

CRITICAL CANONICAL RULES:
1. You MUST generate pure JSON ONLY. Do NOT wrap in markdown code blocks like \`\`\`json.
2. No HTML tags, no <script>, no <iframe>, no Tailwind classes, no custom DOM attributes.
3. The JSON MUST strictly follow this exact 10-module sequence in "sections":
   - Index 0: "header" (announcement, showAnnouncement: true, title: "${brandName}")
   - Index 1: "hero" (tag, title, subtitle, description, buttonText, buttonLink: "#products", imageUrl)
   - Index 2: "featured_products" (tag, title, subtitle, columns: 3, count: 6)
   - Index 3: "collection" (tag, title, subtitle, description, buttonText, buttonLink: "#products", imagePosition: "right", imageUrl)
   - Index 4: "image_text" (tag, title, subtitle, description, buttonText, buttonLink: "#products", imagePosition: "left", imageUrl)
   - Index 5: "rich_text" (tag, title, subtitle, description)
   - Index 6: "testimonials" (tag, title, testimonialsList: Array of 3 items { name, role, quote, rating: 5 })
   - Index 7: "faq" (tag, title, faqList: Array of 3 items { question, answer })
   - Index 8: "cta" (tag, title, subtitle, description, buttonText, buttonLink: "#products")
   - Index 9: "footer" (title: "${brandName}", showTrustBadges: true, trustBadge1, trustBadge2, trustBadge3, copyright)
4. Add "globalInfo": {
     "brandName": "${brandName}",
     "tagline": "Tailored ${productCategory} for ${targetAudience}",
     "contact": { "email": "concierge@${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com", "address": "Metropolitan Studio", "contactUrl": "#sec-cta" },
     "social": { "instagram": "https://instagram.com", "x": "https://x.com" }
   }
5. "version": "1.0.0"
6. "theme": { "themeId": "${visualDirection}" }
7. "meta": { "lastModified": "${new Date().toISOString()}", "published": true }
`

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      })

      let text = response.text || ''
      text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()

      const parsed = JSON.parse(text)

      // 2. Canonical 验证器严格校验
      const valResult = validateCanonicalTemplateSchema(parsed)
      if (valResult.valid) {
        generatedSchema = normalizeStorefrontSchema(parsed)
      } else {
        console.warn('AI generated schema failed canonical validation:', valResult.errors)
      }
    } catch (err) {
      console.error('Gemini AI template generation error:', err)
    }
  }

  // 3. 容错降级：若 AI 未配置、网络异常或校验失败，优雅退回到基线模板并进行定制化
  if (!generatedSchema) {
    const fallback = createDefaultSchema()
    fallback.theme.themeId = visualDirection
    fallback.globalInfo = {
      brandName,
      tagline: `${brandPositioning} · ${productCategory}`,
      contact: {
        email: `concierge@${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        address: 'Studio Atelier',
        contactUrl: '#sec-cta',
      },
      social: {
        instagram: 'https://instagram.com',
        x: 'https://x.com',
      },
    }
    fallback.contact = fallback.globalInfo.contact
    fallback.social = fallback.globalInfo.social

    // 更新 Header 和 Footer title
    fallback.sections = fallback.sections.map((sec) => {
      if (sec.type === 'header' || sec.type === 'footer') {
        return { ...sec, content: { ...sec.content, title: brandName } }
      }
      if (sec.type === 'hero') {
        return {
          ...sec,
          content: {
            ...sec.content,
            title: isZh ? `${brandName} 智选呈现` : `${brandName} Signature Collection`,
            description: brandPositioning,
          },
        }
      }
      return sec
    })

    generatedSchema = fallback
  }

  // 4. 持久化存入 templates 表
  const templateId = `ai-template-${Date.now()}`
  try {
    const supabase = await createClientServer()

    const { error: insertError } = await supabase.from('templates').insert({
      id: templateId,
      name: `${brandName} (${visualDirection.toUpperCase()} AI)`,
      layout_config: generatedSchema,
      status: 'active',
      created_at: new Date().toISOString(),
    } as any)

    if (insertError) {
      console.error('Failed to insert AI template:', insertError)
      // 继续返回 Schema 允许在内存中使用
    }

    return {
      success: true,
      templateId,
      schema: generatedSchema,
    }
  } catch (err) {
    console.error('Database insert exception:', err)
    return {
      success: true,
      templateId,
      schema: generatedSchema,
    }
  }
}

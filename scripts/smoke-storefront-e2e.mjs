/**
 * Storefront E2E Smoke — 编辑器闭环的端到端验证（只读写测试用户自己的店铺）。
 *
 * 验证链路：
 *   canonical schema → store_settings.theme_config → 公开路由渲染
 *
 * 用例：
 *   A. canonical 已发布 → 200，hero 标题可见，隐藏分区不可见，无 demo 商品文案，
 *      accent/radius 覆盖注入 HTML
 *   B. canonical 草稿 + store_pages 未发布 → 404
 *   C. legacy { theme_id } + 已发布 store_pages → 200（向后兼容，hero=店名）
 *
 * 运行前置：dev server 已在 :3000 运行；.env.local 含 Supabase 凭据；
 * .diag-test-user.json 含测试用户。结束后恢复原 theme_config / store_pages 状态。
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)

const testUser = JSON.parse(readFileSync('.diag-test-user.json', 'utf8'))
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

const BASE = process.env.SMOKE_BASE_URL || 'http://localhost:3000'
const HERO_MARK = 'E2E_HERO_TITLE_9f3k'
const HIDDEN_MARK = 'E2E_HIDDEN_SECTION_7qz2'
const ACCENT = '#FF3366'

let passed = 0
let failed = 0
const check = (name, cond) => {
  if (cond) {
    passed++
    console.log(`  PASS  ${name}`)
  } else {
    failed++
    console.log(`  FAIL  ${name}`)
  }
}

const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
  email: testUser.email,
  password: testUser.password,
})
if (authError || !auth.user) {
  console.error('AUTH FAILED', authError?.message)
  process.exit(1)
}

const { data: store, error: storeError } = await supabase
  .from('stores')
  .select('id, store_slug, store_name')
  .eq('owner_id', auth.user.id)
  .single()
if (storeError || !store) {
  console.error('STORE NOT FOUND', storeError?.message)
  process.exit(1)
}
console.log(`store: ${store.store_name} (/${store.store_slug})`)

// 备份原状态
const { data: origSettings } = await supabase
  .from('store_settings')
  .select('theme_config, seo_config')
  .eq('store_id', store.id)
  .maybeSingle()
const { data: origPage } = await supabase
  .from('store_pages')
  .select('id, template_id, sections, published')
  .eq('store_id', store.id)
  .maybeSingle()

const canonicalSchema = {
  version: '1.0.0',
  theme: { themeId: 'electric-violet', accent: ACCENT, radius: 20 },
  sections: [
    { id: 'sec-header', type: 'header', order: 0, visible: true, content: { title: store.store_name, showAnnouncement: false }, style: { padding: 'standard', bgStyle: 'default' } },
    { id: 'sec-hero', type: 'hero', order: 1, visible: true, content: { title: HERO_MARK, description: 'e2e desc', buttonText: 'Shop', buttonLink: '#products' }, style: { padding: 'standard', bgStyle: 'default' } },
    { id: 'sec-products', type: 'featured_products', order: 2, visible: true, content: { title: 'Featured', columns: 3, count: 6 }, style: { padding: 'standard', bgStyle: 'default' } },
    { id: 'sec-hidden', type: 'rich_text', order: 3, visible: false, content: { title: HIDDEN_MARK, description: HIDDEN_MARK }, style: { padding: 'standard', bgStyle: 'default' } },
    { id: 'sec-footer', type: 'footer', order: 4, visible: true, content: { title: store.store_name }, style: { padding: 'standard', bgStyle: 'default' } },
  ],
  meta: { lastModified: new Date().toISOString(), published: true },
}

async function writeConfig(themeConfig, pagePublished) {
  const { error: e1 } = await supabase
    .from('store_settings')
    .upsert({ store_id: store.id, theme_config: themeConfig, seo_config: {} }, { onConflict: 'store_id' })
  if (e1) throw new Error('settings write failed: ' + e1.message)
  const { error: e2 } = await supabase
    .from('store_pages')
    .upsert({ store_id: store.id, template_id: 'electric-violet', sections: [], published: pagePublished }, { onConflict: 'store_id' })
  if (e2) throw new Error('pages write failed: ' + e2.message)
}

async function fetchStore() {
  const res = await fetch(`${BASE}/store/${store.store_slug}`, { redirect: 'manual' })
  return { status: res.status, html: await res.text() }
}

try {
  // ---- Test A: canonical published ----
  console.log('\n[A] canonical schema published')
  await writeConfig(canonicalSchema, true)
  const a = await fetchStore()
  check('status 200', a.status === 200)
  check('hero title rendered', a.html.includes(HERO_MARK))
  check('hidden section NOT rendered', !a.html.includes(HIDDEN_MARK))
  check('no demo $99.00', !a.html.includes('$99.00'))
  check('accent override injected', a.html.includes(ACCENT))
  check('radius override injected', a.html.includes('20px'))
  check('theme vars injected', a.html.includes('--th-color-primary'))

  // ---- Test B: canonical draft → 404 ----
  console.log('\n[B] canonical schema draft (unpublished)')
  await writeConfig({ ...canonicalSchema, meta: { ...canonicalSchema.meta, published: false } }, false)
  const b = await fetchStore()
  check('status 404', b.status === 404)
  check('hero title NOT rendered', !b.html.includes(HERO_MARK))

  // ---- Test C: legacy theme_id + published store_pages ----
  console.log('\n[C] legacy theme_id config (backward compat)')
  await writeConfig({ theme_id: 'electric-violet' }, true)
  const c = await fetchStore()
  check('status 200', c.status === 200)
  check('legacy hero falls back to store name', c.html.includes(store.store_name))
} finally {
  // 恢复原状态
  console.log('\n[restore] original state')
  if (origSettings) {
    await supabase
      .from('store_settings')
      .upsert({ store_id: store.id, theme_config: origSettings.theme_config, seo_config: origSettings.seo_config ?? {} }, { onConflict: 'store_id' })
  }
  if (origPage) {
    await supabase
      .from('store_pages')
      .upsert({ store_id: store.id, template_id: origPage.template_id, sections: origPage.sections ?? [], published: origPage.published }, { onConflict: 'store_id' })
  }
}

console.log(`\nRESULT: ${passed} passed, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)

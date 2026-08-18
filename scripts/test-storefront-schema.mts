/**
 * Storefront 契约单元测试（离线，无需 Supabase）：
 *   - normalizeStorefrontSchema: canonical 直通 / legacy 迁移 / 脏数据
 *   - storefrontThemeOverrides: accent/radius → --th-* 覆盖
 *
 * 运行：node --experimental-strip-types scripts/test-storefront-schema.mts
 */
import { normalizeStorefrontSchema, createDefaultSchema } from '../lib/storefront/schema.ts'
import { storefrontThemeOverrides } from '../lib/storefront/theme-overrides.ts'

let passed = 0
let failed = 0
function check(name: string, cond: boolean) {
  if (cond) { passed++; console.log(`  PASS  ${name}`) }
  else { failed++; console.log(`  FAIL  ${name}`) }
}

// ---- canonical 直通 ----
console.log('[canonical]')
const canonical = {
  version: '1.0.0',
  theme: { themeId: 'electric-violet', accent: '#FF3366', radius: 20 },
  sections: [
    { id: 'sec-hero', type: 'hero', order: 0, visible: true, content: { title: 'Hello' } },
    { id: 'bad', type: 'not-a-type', order: 1, visible: true, content: {} },
    'garbage',
    { id: 'sec-footer', type: 'footer', order: 2, visible: false, content: {} },
  ],
  meta: { lastModified: '2026-08-18T00:00:00.000Z', published: true },
}
const c = normalizeStorefrontSchema(canonical)
check('returns schema', c !== null)
check('preserves themeId', c?.theme.themeId === 'electric-violet')
check('preserves accent', c?.theme.accent === '#FF3366')
check('preserves radius', c?.theme.radius === 20)
check('drops malformed sections', c?.sections.length === 2)
check('keeps valid hero', c?.sections[0].id === 'sec-hero')
check('preserves published=true', c?.meta.published === true)
check('preserves visibility=false', c?.sections[1].visible === false)

// ---- canonical 缺 meta.published → false ----
const noPub = normalizeStorefrontSchema({
  version: '1.0.0', theme: { themeId: 'electric-violet' }, sections: [], meta: {},
})
check('missing published coerces to false', noPub?.meta.published === false)

// ---- legacy 迁移 ----
console.log('[legacy]')
const legacy = normalizeStorefrontSchema({ theme_id: 'electric-violet' })
check('legacy returns schema', legacy !== null)
check('legacy themeId migrated', legacy?.theme.themeId === 'electric-violet')
check('legacy gets default sections', (legacy?.sections.length ?? 0) === createDefaultSchema().sections.length)
check('legacy published=false (gate falls back to store_pages)', legacy?.meta.published === false)

// legacy 带无关键不崩溃
const legacyExtra = normalizeStorefrontSchema({ theme_id: 'electric-violet', some_other_key: 1 })
check('legacy with extra keys still migrates', legacyExtra?.theme.themeId === 'electric-violet')

// canonical 与 legacy 键并存时 canonical 优先
const mixed = normalizeStorefrontSchema({
  version: '1.0.0', theme: { themeId: 'electric-violet' }, sections: [], meta: { published: true },
  theme_id: 'should-be-ignored',
})
check('canonical wins over legacy key', mixed?.theme.themeId === 'electric-violet' && mixed?.meta.published === true)

// ---- 脏数据 ----
console.log('[dirty]')
check('null → null', normalizeStorefrontSchema(null) === null)
check('undefined → null', normalizeStorefrontSchema(undefined) === null)
check('string → null', normalizeStorefrontSchema('x') === null)
check('array → null', normalizeStorefrontSchema([]) === null)
check('empty object → null', normalizeStorefrontSchema({}) === null)

// ---- theme overrides ----
console.log('[overrides]')
const ov = storefrontThemeOverrides({ themeId: 'electric-violet', accent: '#FF3366', radius: 20 })
check('accent → --th-color-primary', ov['--th-color-primary'] === '#FF3366')
check('accent → --th-color-accent', ov['--th-color-accent'] === '#FF3366')
check('radius → --th-radius-card', ov['--th-radius-card'] === '20px')
check('radius → --th-radius-button', ov['--th-radius-button'] === '20px')
const ovEmpty = storefrontThemeOverrides({ themeId: 'electric-violet' })
check('no accent/radius → empty', Object.keys(ovEmpty).length === 0)
const ovClamp = storefrontThemeOverrides({ themeId: 'electric-violet', radius: 999 })
check('radius clamped to 64px', ovClamp['--th-radius-card'] === '64px')

console.log(`\nRESULT: ${passed} passed, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)

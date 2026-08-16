/**
 * Omnilink Theme System — Phase 13 基础类型契约。
 *
 * 分层职责（严格遵守）：
 *   Theme     = 视觉语言（本文件定义的 tokens + variants）
 *   Template  = 固定页面结构（Homepage / ProductPage / CollectionPage）
 *   Component = 可复用 UI（components/theme/core/*，消费 --th-* 变量）
 *
 * 约定：
 *   - 组件一律通过 `var(--th-*)` 消费令牌，禁止硬编码视觉值。
 *   - 字体令牌只引用 layout 已注入的字体变量（--font-heading / --font-sans），
 *     不新建字体体系。
 *   - 本文件只含类型，不含任何运行时值；具体主题（如 electric-violet）
 *     在后续任务中定义。
 */

/** 固定页面模板标识。 */
export type TemplateId = 'home' | 'product' | 'collection'

export interface ThemeColorTokens {
  primary: string
  background: string
  surface: string
  text: string
  muted: string
  border: string
  accent: string
}

export interface ThemeTypographyTokens {
  /** CSS font-family 值，应引用现有变量，如 `var(--font-heading)`。 */
  headingFont: string
  /** CSS font-family 值，应引用现有变量，如 `var(--font-sans)`。 */
  bodyFont: string
  headingWeight: string | number
  bodyWeight: string | number
}

export interface ThemeRadiusTokens {
  card: string
  button: string
  input: string
}

export interface ThemeSpacingTokens {
  section: string
  container: string
  grid: string
}

export interface ThemeShadowTokens {
  card: string
  floating: string
}

export interface ThemeMotionTokens {
  duration: string
  easing: string
}

/**
 * 一套主题的完整设计令牌。
 * 每个叶子值会被编译为 `--th-<group>-<name>` 形式的 CSS 变量
 * （见 tokens-to-css.ts）。
 */
export interface ThemeTokens {
  colors: ThemeColorTokens
  typography: ThemeTypographyTokens
  radius: ThemeRadiusTokens
  spacing: ThemeSpacingTokens
  shadows: ThemeShadowTokens
  motion: ThemeMotionTokens
}

/**
 * 组件级可选变体。全部为可选；缺省时组件使用自身默认形态。
 * 用于让同一套 core 组件在不同主题下呈现受控差异，
 * 而不需要为主题复制组件实现。
 */
export interface ComponentVariant {
  navbar?: 'default' | 'floating'
  hero?: 'default' | 'split'
  productCard?: 'flat' | 'acrylic'
  productGrid?: 'default' | 'compact'
  productHero?: 'default' | 'split'
  cta?: 'default' | 'banner'
  footer?: 'default'
}

/** 一套主题的完整定义（注册表 registry 的元素类型）。 */
export interface ThemeDefinition {
  /** 机器可读 id，同时用作 `[data-theme="<id>"]` 作用域选择器。 */
  id: string
  /** 展示名。 */
  name: string
  description?: string
  tokens: ThemeTokens
  variants?: ComponentVariant
  /** 该主题支持的固定模板集合。 */
  templates: readonly TemplateId[]
}

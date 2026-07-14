export type DesignPlatform = 'desktop-web' | 'mobile-app' | 'dashboard' | 'editor' | 'generic'

export type DesignIndustry =
  | 'saas'
  | 'fintech'
  | 'ecommerce'
  | 'media'
  | 'ai'
  | 'healthcare'
  | 'education'
  | 'creative'
  | 'productivity'
  | 'generic'

export type DesignTone =
  | 'minimal'
  | 'editorial'
  | 'playful'
  | 'premium'
  | 'technical'
  | 'friendly'

export interface DesignPalette {
  canvas: string
  surface: string
  surfaceAlt: string
  textPrimary: string
  textSecondary: string
  border: string
  accent: string
  accentAlt: string
}

export interface DesignTypography {
  display: string
  body: string
  scale: readonly number[]
}

export interface DesignLayoutPlan {
  shell: string
  sections: string[]
  patterns: string[]
}

export interface DesignSystemRecommendation {
  platform: DesignPlatform
  industry: DesignIndustry
  tone: DesignTone
  style: string
  viewport: { width: number; height: number; rationale: string }
  palette: DesignPalette
  typography: DesignTypography
  spacingScale: readonly number[]
  radiusScale: readonly number[]
  layout: DesignLayoutPlan
  components: string[]
  motion: string[]
  antiPatterns: string[]
  prompts: string[]
  rationale: string[]
  brief: string
}
import {
  INDUSTRY_SCORES,
  PALETTES,
  PLATFORM_SCORES,
  STYLE_BY_INDUSTRY,
  TONE_SCORES,
  TYPOGRAPHY_BY_TONE,
  type KeywordScore
} from '@/app/ai/design-system/presets'

function normalizeBrief(brief: string): string {
  return brief.trim().toLowerCase().replace(/\s+/g, ' ')
}

function scoreKeywords<T extends string>(brief: string, defs: KeywordScore<T>[]): T | null {
  let best: { value: T; score: number } | null = null
  for (const def of defs) {
    const score = def.keywords.reduce((sum, keyword) => sum + (brief.includes(keyword) ? 1 : 0), 0)
    if (score === 0) continue
    if (!best || score > best.score) {
      best = { value: def.value, score }
    }
  }
  return best?.value ?? null
}

function inferPlatform(brief: string): DesignPlatform {
  return scoreKeywords(brief, PLATFORM_SCORES) ?? 'generic'
}

function inferIndustry(brief: string): DesignIndustry {
  return scoreKeywords(brief, INDUSTRY_SCORES) ?? 'generic'
}

function inferTone(brief: string, industry: DesignIndustry): DesignTone {
  const explicit = scoreKeywords(brief, TONE_SCORES)
  if (explicit) return explicit
  if (industry === 'media') return 'editorial'
  if (industry === 'fintech' || industry === 'healthcare') return 'premium'
  if (industry === 'ai' || industry === 'productivity') return 'technical'
  if (industry === 'creative' || industry === 'education') return 'friendly'
  return 'minimal'
}

function viewportFor(platform: DesignPlatform): DesignSystemRecommendation['viewport'] {
  if (platform === 'mobile-app') {
    return { width: 390, height: 844, rationale: 'Mobile-first app artboard' }
  }
  if (platform === 'dashboard') {
    return { width: 1440, height: 1024, rationale: 'Desktop dashboard with side navigation' }
  }
  if (platform === 'editor') {
    return { width: 1440, height: 960, rationale: 'Desktop editor shell with dense tooling' }
  }
  if (platform === 'desktop-web') {
    return { width: 1440, height: 1600, rationale: 'Desktop web layout with vertical scroll' }
  }
  return { width: 1280, height: 1200, rationale: 'Generic product surface' }
}

function sectionsFor(platform: DesignPlatform, industry: DesignIndustry): string[] {
  if (platform === 'mobile-app') {
    return ['status bar', 'top bar', 'core task area', 'primary cards or list', 'bottom navigation']
  }
  if (platform === 'dashboard') {
    return ['sidebar', 'top summary row', 'primary chart or work area', 'secondary widgets']
  }
  if (platform === 'editor') {
    return ['left navigation', 'main canvas or work area', 'floating toolbars', 'right properties panel']
  }
  if (industry === 'media') {
    return ['navigation', 'hero lead story', 'main stories grid', 'sidebar modules', 'footer']
  }
  if (industry === 'ecommerce') {
    return ['announcement or navigation', 'hero merchandising', 'category or product cards', 'trust strip', 'footer']
  }
  return ['navigation', 'hero section', 'core value sections', 'supporting cards', 'footer']
}

function patternsFor(platform: DesignPlatform, industry: DesignIndustry): string[] {
  const patterns = [
    'use 8px spacing rhythm',
    'build skeleton containers first, then fill content',
    'prefer one clear primary action per screen',
    'keep hierarchy obvious with one dominant hero or lead module',
    'use fewer larger modules instead of many tiny cards when the brief is vague'
  ]
  if (platform === 'mobile-app') {
    patterns.push('use bottom navigation with 4-5 items', 'prefer stacked cards and large tap targets')
  }
  if (platform === 'dashboard') {
    patterns.push('use 12-column grid', 'pair summary metrics with one dominant chart')
  }
  if (platform === 'editor') {
    patterns.push('reserve center for canvas', 'use floating utility chrome instead of heavy borders')
  }
  if (industry === 'media') patterns.push('mix one dominant headline with dense secondary stories')
  if (industry === 'ecommerce') {
    patterns.push('keep CTAs visually consistent', 'surface product imagery before descriptive text')
  }
  if (industry === 'fintech') patterns.push('lead with trust metrics and calm hierarchy')
  if (industry === 'ai') patterns.push('blend technical precision with approachable onboarding')
  return patterns
}

function componentsFor(platform: DesignPlatform, industry: DesignIndustry): string[] {
  const components = ['buttons', 'cards', 'section headers', 'icon + text rows']
  if (platform === 'mobile-app') components.push('bottom tabs', 'floating action surface')
  if (platform === 'dashboard') components.push('metric cards', 'data table rows', 'chart containers')
  if (platform === 'editor') components.push('tool dock', 'property panels', 'canvas overlays')
  if (industry === 'media') components.push('story cards', 'ticker', 'sidebar modules')
  if (industry === 'ecommerce') components.push('product cards', 'price modules', 'review snippets')
  return components
}

function motionFor(platform: DesignPlatform): string[] {
  if (platform === 'editor') {
    return [
      'use purposeful fades for overlays',
      'use subtle stagger on panel content',
      'avoid heavy spring animations on canvas chrome'
    ]
  }
  if (platform === 'mobile-app') {
    return ['use short slide/fade transitions', 'emphasize bottom-sheet and tab feedback']
  }
  return ['use sparse staggered reveals', 'animate state changes, not decorative loops']
}

function antiPatternsFor(platform: DesignPlatform, industry: DesignIndustry): string[] {
  const antiPatterns = [
    'do not mix too many accent colors',
    'do not alternate unrelated corner radii',
    'avoid walls of equal-weight text',
    'avoid turning every brief into a dense dashboard',
    'avoid more than five major modules above the fold unless the user explicitly asks for density'
  ]
  if (platform === 'dashboard') {
    antiPatterns.push('avoid equal emphasis across all widgets', 'avoid more than one dense table above the fold')
  }
  if (platform === 'mobile-app') antiPatterns.push('avoid tiny tap targets', 'avoid desktop-sized text blocks')
  if (industry === 'fintech') antiPatterns.push('avoid neon or casino-like treatment')
  if (industry === 'media') antiPatterns.push('avoid overly centered layouts that weaken scanning')
  if (platform === 'editor') antiPatterns.push('avoid thick borders around every panel')
  return antiPatterns
}

function promptsFor(
  platform: DesignPlatform,
  palette: DesignPalette,
  typography: DesignTypography
): string[] {
  const prompts = [
    '默认使用简体中文文案，除非用户明确要求其他语言。',
    '先把用户的口语化需求翻译成专业的页面结构、组件命名和交互目标，再开始设计。',
    '优先选择普通用户熟悉的产品场景与页面流程，避免过于小众或概念化的表达。',
    '当用户只说“做一个原型”时，先做一个聚焦核心任务的 MVP 页面，而不是一次铺满整个产品矩阵。',
    '优先保证主次层级、留白和可扫描性，不要用过多小卡片堆满页面。',
    `主强调色使用 ${palette.accent}，更强强调使用 ${palette.accentAlt}。`,
    `标题优先使用 ${typography.display}，正文优先使用 ${typography.body}。`
  ]
  if (platform === 'dashboard') prompts.push('先建立清晰的分区骨架，再放入图表和表格内容。')
  if (platform === 'mobile-app') prompts.push('每个页面只保留一个主行动按钮，保证纵向流程一眼能懂。')
  if (platform === 'editor') prompts.push('保持中间工作区安静克制，让画布或主内容成为视觉中心。')
  return prompts
}

function rationaleFor(
  platform: DesignPlatform,
  industry: DesignIndustry,
  tone: DesignTone,
  style: string
): string[] {
  return [
    `平台推断：${platform}。`,
    `行业推断：${industry}。`,
    `气质推断：${tone}。`,
    `风格方向：${style}。`
  ]
}

function composeBrief(system: Omit<DesignSystemRecommendation, 'brief'>): string {
  const sectionList = system.layout.sections.map((section, index) => `${index + 1}. ${section}`).join('\n')
  const patternList = system.layout.patterns.map((pattern) => `- ${pattern}`).join('\n')
  const antiPatternList = system.antiPatterns.map((pattern) => `- ${pattern}`).join('\n')
  const promptList = system.prompts.map((prompt) => `- ${prompt}`).join('\n')

  return [
    '设计系统建议',
    '默认语言：简体中文',
    `平台：${system.platform}`,
    `行业：${system.industry}`,
    `气质：${system.tone}`,
    `风格：${system.style}`,
    `视口：${system.viewport.width}x${system.viewport.height}（${system.viewport.rationale}）`,
    `配色：画布 ${system.palette.canvas}，内容面 ${system.palette.surface}，强调色 ${system.palette.accent}，强强调 ${system.palette.accentAlt}，主文字 ${system.palette.textPrimary}`,
    `字体：标题 ${system.typography.display}，正文 ${system.typography.body}，字号梯度 ${system.typography.scale.join(' / ')}`,
    `布局骨架：${system.layout.shell}`,
    `推荐区块：\n${sectionList}`,
    `设计模式：\n${patternList}`,
    `执行提醒：\n${promptList}`,
    `避免：\n${antiPatternList}`
  ].join('\n')
}

function shellFor(platform: DesignPlatform): string {
  if (platform === 'mobile-app') return 'single-column mobile shell'
  if (platform === 'dashboard') return 'left-nav + content grid shell'
  if (platform === 'editor') return 'multi-panel editor shell'
  return 'top-down marketing/content shell'
}

export function generateDesignSystem(briefInput: string): DesignSystemRecommendation {
  const brief = normalizeBrief(briefInput)
  const platform = inferPlatform(brief)
  const industry = inferIndustry(brief)
  const tone = inferTone(brief, industry)
  const style = STYLE_BY_INDUSTRY[industry]
  const palette = PALETTES[industry]
  const typography = TYPOGRAPHY_BY_TONE[tone]
  const viewport = viewportFor(platform)
  const layout: DesignLayoutPlan = {
    shell: shellFor(platform),
    sections: sectionsFor(platform, industry),
    patterns: patternsFor(platform, industry)
  }

  const system: Omit<DesignSystemRecommendation, 'brief'> = {
    platform,
    industry,
    tone,
    style,
    viewport,
    palette,
    typography,
    spacingScale: [4, 8, 12, 16, 24, 32, 48],
    radiusScale: [4, 8, 12, 16, 24],
    layout,
    components: componentsFor(platform, industry),
    motion: motionFor(platform),
    antiPatterns: antiPatternsFor(platform, industry),
    prompts: promptsFor(platform, palette, typography),
    rationale: rationaleFor(platform, industry, tone, style)
  }

  return {
    ...system,
    brief: composeBrief(system)
  }
}

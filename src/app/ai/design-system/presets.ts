import type { DesignIndustry, DesignPalette, DesignPlatform, DesignTone, DesignTypography } from '@/app/ai/design-system/generator'

export interface KeywordScore<T extends string> {
  value: T
  keywords: string[]
}

export const PLATFORM_SCORES: KeywordScore<DesignPlatform>[] = [
  {
    value: 'mobile-app',
    keywords: [
      'mobile',
      'app',
      'iphone',
      'android',
      'ios',
      'phone',
      'bottom tab',
      'tablet portrait',
      '手机',
      '移动端',
      '移动应用',
      '小程序',
      '安卓',
      '底部导航'
    ]
  },
  {
    value: 'dashboard',
    keywords: [
      'dashboard',
      'admin',
      'analytics',
      'data table',
      'chart',
      'console',
      'back office',
      '仪表盘',
      '看板',
      '后台',
      '管理台',
      '数据表',
      '图表'
    ]
  },
  {
    value: 'editor',
    keywords: [
      'editor',
      'figma',
      'canvas',
      'design tool',
      'creative tool',
      'workspace editor',
      '编辑器',
      '画布',
      '设计工具',
      '创作工具'
    ]
  },
  {
    value: 'desktop-web',
    keywords: [
      'landing page',
      'homepage',
      'website',
      'web app',
      'marketing site',
      'desktop site',
      '官网',
      '落地页',
      '首页',
      '网站',
      '网页',
      'web'
    ]
  }
]

export const INDUSTRY_SCORES: KeywordScore<DesignIndustry>[] = [
  {
    value: 'fintech',
    keywords: [
      'fintech',
      'bank',
      'trading',
      'crypto',
      'wallet',
      'payments',
      'brokerage',
      'finance',
      '金融',
      '银行',
      '钱包',
      '支付',
      '理财',
      '记账',
      '账单'
    ]
  },
  {
    value: 'ecommerce',
    keywords: [
      'shop',
      'store',
      'cart',
      'checkout',
      'product detail',
      'catalog',
      'retail',
      '电商',
      '商城',
      '购物',
      '下单',
      '商品',
      '零售'
    ]
  },
  {
    value: 'media',
    keywords: [
      'news',
      'media',
      'magazine',
      'article',
      'blog',
      'storytelling',
      'editorial',
      '资讯',
      '新闻',
      '文章',
      '博客',
      '内容平台'
    ]
  },
  {
    value: 'ai',
    keywords: [
      'ai',
      'llm',
      'agent',
      'prompt',
      'automation',
      'machine learning',
      '人工智能',
      '大模型',
      '智能体',
      '提示词',
      '自动化'
    ]
  },
  {
    value: 'healthcare',
    keywords: [
      'health',
      'medical',
      'clinic',
      'doctor',
      'patient',
      'wellness',
      '医疗',
      '健康',
      '医院',
      '患者',
      '挂号',
      '问诊'
    ]
  },
  {
    value: 'education',
    keywords: [
      'course',
      'learning',
      'education',
      'student',
      'class',
      'lesson',
      '教育',
      '学习',
      '课程',
      '学生',
      '课堂',
      '作业'
    ]
  },
  {
    value: 'creative',
    keywords: [
      'portfolio',
      'gallery',
      'brand',
      'creative',
      'agency',
      'showcase',
      '作品集',
      '品牌',
      '创意',
      '展示',
      '画廊'
    ]
  },
  {
    value: 'productivity',
    keywords: [
      'task',
      'calendar',
      'note',
      'workspace',
      'project',
      'collaboration',
      'efficiency',
      'productivity',
      '效率',
      '待办',
      '日历',
      '笔记',
      '项目协作',
      '办公'
    ]
  },
  {
    value: 'saas',
    keywords: ['saas', 'workspace', 'b2b', 'crm', 'team', 'operations', '企业服务', '团队', '客户管理']
  }
]

export const TONE_SCORES: KeywordScore<DesignTone>[] = [
  { value: 'premium', keywords: ['luxury', 'premium', 'elegant', 'refined', '高端', '精致'] },
  { value: 'playful', keywords: ['playful', 'fun', 'kids', 'gaming', 'youthful', '活泼', '有趣'] },
  { value: 'editorial', keywords: ['editorial', 'story', 'magazine', 'article', 'narrative', '杂志感', '叙事'] },
  { value: 'technical', keywords: ['technical', 'system', 'developer', 'data-heavy', 'precise', '科技感', '专业'] },
  { value: 'friendly', keywords: ['community', 'social', 'simple', 'friendly', 'warm', '亲和', '易用', '新手'] },
  { value: 'minimal', keywords: ['minimal', 'clean', 'simple', 'spacious', '简洁', '留白'] }
]

export const STYLE_BY_INDUSTRY: Record<DesignIndustry, string> = {
  saas: 'clean product SaaS',
  fintech: 'high-trust analytical',
  ecommerce: 'conversion-first merchandising',
  media: 'editorial information-rich',
  ai: 'technical future-facing',
  healthcare: 'calm accessible clinical',
  education: 'structured learning workspace',
  creative: 'visual-forward portfolio',
  productivity: 'focused utility workspace',
  generic: 'modern balanced product'
}

export const PALETTES: Record<DesignIndustry, DesignPalette> = {
  saas: {
    canvas: '#F5F7FB',
    surface: '#FFFFFF',
    surfaceAlt: '#EEF2FF',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    border: '#DCE3F0',
    accent: '#3B82F6',
    accentAlt: '#1D4ED8'
  },
  fintech: {
    canvas: '#F6F7F4',
    surface: '#FFFFFF',
    surfaceAlt: '#E9F1EA',
    textPrimary: '#10231A',
    textSecondary: '#496154',
    border: '#D7E2D8',
    accent: '#0F9D58',
    accentAlt: '#0A6E3D'
  },
  ecommerce: {
    canvas: '#FAF7F2',
    surface: '#FFFFFF',
    surfaceAlt: '#FFF1E6',
    textPrimary: '#2A2119',
    textSecondary: '#6C5B4B',
    border: '#EADDCB',
    accent: '#F97316',
    accentAlt: '#C2410C'
  },
  media: {
    canvas: '#F5F5F0',
    surface: '#FFFFFF',
    surfaceAlt: '#F1EEE5',
    textPrimary: '#14181F',
    textSecondary: '#5B6472',
    border: '#D9D7CC',
    accent: '#D4382C',
    accentAlt: '#9F251C'
  },
  ai: {
    canvas: '#0B1020',
    surface: '#121A2B',
    surfaceAlt: '#19243D',
    textPrimary: '#F8FAFC',
    textSecondary: '#A8B3CF',
    border: '#26324F',
    accent: '#38BDF8',
    accentAlt: '#0EA5E9'
  },
  healthcare: {
    canvas: '#F4FAF9',
    surface: '#FFFFFF',
    surfaceAlt: '#E6F6F2',
    textPrimary: '#10342F',
    textSecondary: '#51706B',
    border: '#D2E8E2',
    accent: '#14B8A6',
    accentAlt: '#0F766E'
  },
  education: {
    canvas: '#F8F7FF',
    surface: '#FFFFFF',
    surfaceAlt: '#EEEAFE',
    textPrimary: '#1F2240',
    textSecondary: '#626A8A',
    border: '#D9DDF4',
    accent: '#7C3AED',
    accentAlt: '#5B21B6'
  },
  creative: {
    canvas: '#FBF6F2',
    surface: '#FFFFFF',
    surfaceAlt: '#FDE8E4',
    textPrimary: '#211A1B',
    textSecondary: '#6F5B5E',
    border: '#EAD6D6',
    accent: '#E11D48',
    accentAlt: '#9F1239'
  },
  productivity: {
    canvas: '#F7F7FA',
    surface: '#FFFFFF',
    surfaceAlt: '#EFEFF6',
    textPrimary: '#171923',
    textSecondary: '#5A6175',
    border: '#D8DCE8',
    accent: '#6366F1',
    accentAlt: '#4338CA'
  },
  generic: {
    canvas: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceAlt: '#F1F5F9',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    border: '#D7E0EA',
    accent: '#2563EB',
    accentAlt: '#1D4ED8'
  }
}

export const TYPOGRAPHY_BY_TONE: Record<DesignTone, DesignTypography> = {
  minimal: { display: 'Inter', body: 'Inter', scale: [36, 28, 22, 18, 14, 12] },
  editorial: { display: 'Playfair Display', body: 'Inter', scale: [40, 30, 24, 18, 14, 12] },
  playful: { display: 'Poppins', body: 'Inter', scale: [38, 30, 22, 18, 14, 12] },
  premium: { display: 'Cormorant Garamond', body: 'Inter', scale: [42, 32, 24, 18, 14, 12] },
  technical: { display: 'Space Grotesk', body: 'Inter', scale: [36, 28, 22, 17, 14, 12] },
  friendly: { display: 'Manrope', body: 'Inter', scale: [36, 28, 22, 18, 14, 12] }
}

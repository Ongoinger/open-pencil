import { describe, expect, test } from 'bun:test'

import { generateDesignSystem } from '@/app/ai/design-system/generator'

describe('generateDesignSystem', () => {
  test('infers fintech dashboard recommendations from a trading brief', () => {
    const result = generateDesignSystem(
      'Create a fintech trading dashboard for portfolio analytics with charts, watchlists, and account balance cards.'
    )

    expect(result.platform).toBe('dashboard')
    expect(result.industry).toBe('fintech')
    expect(result.palette.accent).toBe('#0F9D58')
    expect(result.layout.sections).toContain('sidebar')
    expect(result.components).toContain('metric cards')
  })

  test('infers mobile app shell from a mobile product brief', () => {
    const result = generateDesignSystem(
      'Design a mobile app for education with bottom tab navigation, progress cards, and lesson list.'
    )

    expect(result.platform).toBe('mobile-app')
    expect(result.industry).toBe('education')
    expect(result.viewport.width).toBe(390)
    expect(result.layout.sections).toContain('bottom navigation')
  })

  test('infers editorial media styling from a news brief', () => {
    const result = generateDesignSystem(
      'Build a news website homepage with breaking stories, opinions, markets coverage, and a dense sidebar.'
    )

    expect(result.industry).toBe('media')
    expect(result.tone).toBe('editorial')
    expect(result.style).toBe('editorial information-rich')
    expect(result.antiPatterns).toContain('avoid overly centered layouts that weaken scanning')
  })

  test('defaults briefs and prompts to Simplified Chinese guidance for common user scenarios', () => {
    const result = generateDesignSystem('做一个适合新手记账的手机应用，要有首页、账单列表和添加记录入口。')

    expect(result.platform).toBe('mobile-app')
    expect(result.industry).toBe('fintech')
    expect(result.prompts[0]).toContain('简体中文')
    expect(result.prompts[1]).toContain('口语化需求')
    expect(result.brief).toContain('默认语言：简体中文')
  })

  test('steers vague prototype requests toward focused MVP structure instead of dense dashboards', () => {
    const result = generateDesignSystem('做一个 AI 助手原型界面，给普通用户用，先有一个能展示主要功能的页面。')

    expect(result.industry).toBe('ai')
    expect(result.prompts).toContain('当用户只说“做一个原型”时，先做一个聚焦核心任务的 MVP 页面，而不是一次铺满整个产品矩阵。')
    expect(result.antiPatterns).toContain('avoid turning every brief into a dense dashboard')
  })
})

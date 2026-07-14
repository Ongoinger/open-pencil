import { valibotSchema } from '@ai-sdk/valibot'
import { tool } from 'ai'
import * as v from 'valibot'

import type { ToolSet } from 'ai'

import { generateDesignSystem } from '@/app/ai/design-system/generator'

export function createDesignReasoningTools(): ToolSet {
  return {
    generate_design_system: tool({
      description:
        'Generate a structured design system recommendation before creating a new page, app, dashboard, landing page, or major redesign. Returns platform, industry, palette, typography, layout plan, component patterns, and anti-patterns for the current brief.',
      inputSchema: valibotSchema(
        v.object({
          brief: v.pipe(v.string(), v.minLength(8), v.description('The user design request or product brief'))
        })
      ),
      execute: async ({ brief }: { brief: string }) => {
        const system = generateDesignSystem(brief)
        return {
          platform: system.platform,
          industry: system.industry,
          tone: system.tone,
          style: system.style,
          viewport: system.viewport,
          palette: system.palette,
          typography: system.typography,
          spacingScale: system.spacingScale,
          radiusScale: system.radiusScale,
          layout: system.layout,
          components: system.components,
          motion: system.motion,
          antiPatterns: system.antiPatterns,
          prompts: system.prompts,
          rationale: system.rationale,
          brief: system.brief
        }
      }
    })
  }
}

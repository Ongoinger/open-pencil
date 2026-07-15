import type { SceneGraph } from '@open-pencil/scene-graph'

import { solidFillColor } from '#core/io/formats/jsx/helpers'
import { computeContentBounds } from '#core/io/formats/raster'
import { renderNodesToSVG } from '#core/io/formats/svg'

export interface VueExportOptions {
  title?: string
  colorSpace?: 'srgb' | 'display-p3'
  includePageBackground?: boolean
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function toComponentName(title: string): string {
  const parts = title
    .replace(/[^\w\s-]/g, ' ')
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
  const name = parts.join('') || 'Design'
  return /^[A-Za-z]/.test(name) ? name : `Design${name}`
}

function pageBackground(graph: SceneGraph, pageId: string): string | null {
  const page = graph.getNode(pageId)
  if (!page) return null
  return solidFillColor(page.fills)
}

/** Export selection/page as a Vue 3 SFC with inline SVG (same visual fidelity as HTML). */
export function renderNodesToVue(
  graph: SceneGraph,
  pageId: string,
  nodeIds: string[],
  options: VueExportOptions = {}
): string | null {
  const svg = renderNodesToSVG(graph, pageId, nodeIds, {
    xmlDeclaration: false,
    colorSpace: options.colorSpace
  })
  if (!svg) return null

  const bounds = computeContentBounds(graph, nodeIds)
  if (!bounds) return null

  const width = Math.round(bounds.maxX - bounds.minX)
  const title = options.title ?? 'Export'
  const componentName = toComponentName(title)
  const bg =
    options.includePageBackground !== false ? pageBackground(graph, pageId) : null
  const bodyBg = bg ?? '#f5f5f5'

  return `<script setup lang="ts">
defineOptions({ name: '${escapeHtml(componentName)}' })
</script>

<template>
  <div class="op-design" role="img" :aria-label="${escapeHtml(title)}">
    ${svg}
  </div>
</template>

<style scoped>
.op-design {
  display: block;
  width: ${width}px;
  max-width: 100%;
  height: auto;
  margin: 0 auto;
  background: ${bodyBg};
}
.op-design :deep(svg) {
  display: block;
  width: 100%;
  height: auto;
}
</style>
`
}

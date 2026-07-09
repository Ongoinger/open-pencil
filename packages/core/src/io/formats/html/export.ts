import type { SceneGraph } from '#core/scene-graph'
import { solidFillColor } from '#core/io/formats/jsx/helpers'
import { computeContentBounds } from '#core/io/formats/raster'
import { renderNodesToSVG } from '#core/io/formats/svg'

export interface HTMLExportOptions {
  title?: string
  colorSpace?: 'srgb' | 'display-p3'
  /** Apply page background color to the HTML body */
  includePageBackground?: boolean
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function pageBackground(graph: SceneGraph, pageId: string): string | null {
  const page = graph.getNode(pageId)
  if (!page) return null
  return solidFillColor(page.fills)
}

export function renderNodesToHTML(
  graph: SceneGraph,
  pageId: string,
  nodeIds: string[],
  options: HTMLExportOptions = {}
): string | null {
  const svg = renderNodesToSVG(graph, pageId, nodeIds, {
    xmlDeclaration: false,
    colorSpace: options.colorSpace
  })
  if (!svg) return null

  const bounds = computeContentBounds(graph, nodeIds)
  if (!bounds) return null

  const width = Math.round(bounds.maxX - bounds.minX)
  const title = escapeHtml(options.title ?? 'Export')
  const bg =
    options.includePageBackground !== false ? pageBackground(graph, pageId) : null
  const bodyBg = bg ?? '#f5f5f5'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      background: ${bodyBg};
      padding: 24px;
    }
    .design {
      display: block;
      width: ${width}px;
      max-width: 100%;
      height: auto;
    }
    .design svg {
      display: block;
      width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <div class="design">${svg}</div>
</body>
</html>`
}

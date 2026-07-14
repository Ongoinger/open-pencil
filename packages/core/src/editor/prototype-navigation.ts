import type { SceneNode } from '@open-pencil/scene-graph'

export const PROTOTYPE_NAVIGATION_PAGE_ID_KEY = 'prototype.navigation.pageId'

function nextPluginData(
  node: SceneNode,
  pageId: string | null
): SceneNode['pluginData'] {
  const pluginData = node.pluginData.filter(
    (entry) => !(entry.pluginId === 'open-pencil' && entry.key === PROTOTYPE_NAVIGATION_PAGE_ID_KEY)
  )
  if (pageId) {
    pluginData.push({
      pluginId: 'open-pencil',
      key: PROTOTYPE_NAVIGATION_PAGE_ID_KEY,
      value: pageId
    })
  }
  return pluginData
}

export function getPrototypeNavigationPageId(node: SceneNode): string | null {
  const value =
    node.pluginData.find(
      (entry) => entry.pluginId === 'open-pencil' && entry.key === PROTOTYPE_NAVIGATION_PAGE_ID_KEY
    )?.value ?? ''
  return value || null
}

export function setPrototypeNavigationPageId(
  node: SceneNode,
  pageId: string | null
): Partial<SceneNode> {
  return {
    pluginData: nextPluginData(node, pageId)
  }
}

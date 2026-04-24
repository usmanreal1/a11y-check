import traverse from '@babel/traverse'
import * as t from '@babel/types'
import type { ParsedFile } from '../parser'
import type { Issue } from './altText'

function hasTrackCaptions(children: t.JSXElement['children']): boolean {
  for (const child of children) {
    if (!t.isJSXElement(child)) continue
    const opening = child.openingElement
    if (!t.isJSXIdentifier(opening.name) || opening.name.name !== 'track') continue

    const kindAttr = opening.attributes.find(
      (a) =>
        t.isJSXAttribute(a) &&
        t.isJSXIdentifier(a.name) &&
        a.name.name === 'kind'
    )
    if (!kindAttr || !t.isJSXAttribute(kindAttr)) continue
    if (!t.isStringLiteral(kindAttr.value)) continue

    const kind = kindAttr.value.value
    if (kind === 'captions' || kind === 'subtitles') return true
  }
  return false
}

export function videoCaptionsRule(parsed: ParsedFile): Issue[] {
  const issues: Issue[] = []

  traverse(parsed.ast, {
    JSXOpeningElement(path) {
      const name = path.node.name
      if (!t.isJSXIdentifier(name) || name.name !== 'video') return

      // Self-closing <video /> has no children — skip
      if (!t.isJSXElement(path.parent)) return

      const children = path.parent.children
      if (hasTrackCaptions(children)) return

      issues.push({
        rule: 'video-captions',
        severity: 'error',
        message: '<video> is missing a <track kind="captions"> element',
        suggestion:
          'Add <track kind="captions" src="captions.vtt" srclang="en" label="English" /> as a child of <video> to provide captions for users who are deaf or hard of hearing.',
        wcag: 'WCAG 1.2.2 (Level A)',
        line: path.node.loc?.start.line ?? 0,
        column: path.node.loc?.start.column ?? 0,
        filePath: parsed.filePath,
      })
    },
  })

  return issues
}

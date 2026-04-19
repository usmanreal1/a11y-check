import traverse from '@babel/traverse'
import * as t from '@babel/types'
import type { ParsedFile } from '../parser'
import type { Issue } from './altText'

export function autoplayMediaRule(parsed: ParsedFile): Issue[] {
  const issues: Issue[] = []

  traverse(parsed.ast, {
    JSXOpeningElement(path) {
      const name = path.node.name
      if (!t.isJSXIdentifier(name)) return
      if (name.name !== 'video' && name.name !== 'audio') return

      const attrs = path.node.attributes

      const hasAutoplay = attrs.some(
        (a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === 'autoPlay'
      )
      if (!hasAutoplay) return

      const hasMuted = attrs.some(
        (a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === 'muted'
      )

      if (!hasMuted) {
        issues.push({
          rule: 'autoplay-media',
          severity: 'error',
          message: `<${name.name}> autoplays without muted — can be disorienting for users`,
          suggestion: 'Add the muted attribute, or remove autoPlay and let the user control playback',
          wcag: 'WCAG 1.4.2 (Level A)',
          line: path.node.loc?.start.line ?? 0,
          column: path.node.loc?.start.column ?? 0,
          filePath: parsed.filePath,
        })
      }
    },
  })

  return issues
}

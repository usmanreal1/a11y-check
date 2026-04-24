import type { ParsedFile } from '../parser'
import type { Issue } from './altText'
import { altTextRule } from './altText'
import { buttonLabelRule } from './buttonLabel'
import { inputLabelRule } from './inputLabel'
import { selectLabelRule } from './selectLabel'
import { textareaLabelRule } from './textareaLabel'
import { linkTextRule } from './linkText'
import { interactiveRoleRule } from './interactiveRole'
import { ariaValidAttrRule } from './ariaValidAttr'
import { ariaHiddenFocusRule } from './ariaHiddenFocus'
import { langAttributeRule } from './langAttribute'
import { headingOrderRule } from './headingOrder'
import { linkHrefRule } from './linkHref'
import { iframeTitleRule } from './iframeTitle'
import { autoplayMediaRule } from './autoplayMedia'
import { videoCaptionsRule } from './videoCaptions'
import { tabIndexRule } from './tabIndex'
import { duplicateIdRule } from './duplicateId'
import { tableCaptionsRule } from './tableCaptions'
import { tableHeadersRule } from './tableHeaders'

export type { Issue }

export function runAllRules(parsed: ParsedFile): Issue[] {
  return [
    // WCAG 1.1.1 — Non-text Content
    ...altTextRule(parsed),
    // WCAG 1.2.2 — Captions (Prerecorded)
    ...videoCaptionsRule(parsed),
    // WCAG 1.3.1 — Info and Relationships
    ...headingOrderRule(parsed),
    ...inputLabelRule(parsed),
    ...selectLabelRule(parsed),
    ...textareaLabelRule(parsed),
    ...tableCaptionsRule(parsed),
    ...tableHeadersRule(parsed),
    // WCAG 1.4.2 — Audio Control
    ...autoplayMediaRule(parsed),
    // WCAG 2.1.1 — Keyboard
    ...interactiveRoleRule(parsed),
    // WCAG 2.4.1 — Bypass Blocks
    ...iframeTitleRule(parsed),
    // WCAG 2.4.3 — Focus Order
    ...tabIndexRule(parsed),
    // WCAG 2.4.4 — Link Purpose
    ...linkTextRule(parsed),
    ...linkHrefRule(parsed),
    // WCAG 3.1.1 — Language of Page
    ...langAttributeRule(parsed),
    // WCAG 4.1.1 — Parsing
    ...duplicateIdRule(parsed),
    // WCAG 4.1.2 — Name, Role, Value
    ...buttonLabelRule(parsed),
    ...ariaValidAttrRule(parsed),
    ...ariaHiddenFocusRule(parsed),
  ]
}

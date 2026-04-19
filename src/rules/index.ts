import type { ParsedFile } from '../parser'
import type { Issue } from './altText'
import { altTextRule } from './altText'
import { buttonLabelRule } from './buttonLabel'
import { inputLabelRule } from './inputLabel'
import { linkTextRule } from './linkText'
import { interactiveRoleRule } from './interactiveRole'
import { ariaValidAttrRule } from './ariaValidAttr'
import { langAttributeRule } from './langAttribute'
import { headingOrderRule } from './headingOrder'
import { linkHrefRule } from './linkHref'
import { iframeTitleRule } from './iframeTitle'
import { autoplayMediaRule } from './autoplayMedia'

export type { Issue }

export function runAllRules(parsed: ParsedFile): Issue[] {
  return [
    // Level A
    ...altTextRule(parsed),
    ...buttonLabelRule(parsed),
    ...inputLabelRule(parsed),
    ...linkTextRule(parsed),
    ...interactiveRoleRule(parsed),
    ...ariaValidAttrRule(parsed),
    ...langAttributeRule(parsed),
    // Level AA
    ...headingOrderRule(parsed),
    ...linkHrefRule(parsed),
    ...iframeTitleRule(parsed),
    ...autoplayMediaRule(parsed),
  ]
}

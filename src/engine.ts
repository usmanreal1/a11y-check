import type { ParsedFile } from './parser'
import { runAllRules, type Issue } from './rules/index'
import { applyIgnoreComments, applyConfigRules } from './filter'
import type { A11yConfig } from './config'

export interface FileResult {
  filePath: string
  issues: Issue[]
}

const EMPTY_CONFIG: A11yConfig = { rules: {}, exclude: [] }

export function analyzeFiles(
  parsedFiles: ParsedFile[],
  config: A11yConfig = EMPTY_CONFIG
): FileResult[] {
  return parsedFiles.map((parsed) => {
    let issues = runAllRules(parsed)
    issues = applyIgnoreComments(issues, parsed.source)
    issues = applyConfigRules(issues, config.rules)
    return { filePath: parsed.filePath, issues }
  })
}

import fs from 'fs'
import path from 'path'

export type RuleSeverity = 'error' | 'warning' | 'off'

export interface A11yConfig {
  rules: Record<string, RuleSeverity>
  exclude: string[]
}

const DEFAULTS: A11yConfig = {
  rules: {},
  exclude: [],
}

export function loadConfig(cwd: string = process.cwd()): A11yConfig {
  const configPath = path.join(cwd, '.a11yrc.json')

  if (!fs.existsSync(configPath)) return DEFAULTS

  let raw: unknown
  try {
    raw = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  } catch {
    throw new Error(`Could not parse .a11yrc.json — make sure it is valid JSON`)
  }

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new Error(`.a11yrc.json must be a JSON object`)
  }

  const obj = raw as Record<string, unknown>

  const rules: Record<string, RuleSeverity> = {}
  if (obj.rules !== undefined) {
    if (typeof obj.rules !== 'object' || obj.rules === null || Array.isArray(obj.rules)) {
      throw new Error(`.a11yrc.json "rules" must be an object`)
    }
    for (const [rule, value] of Object.entries(obj.rules as Record<string, unknown>)) {
      if (value !== 'error' && value !== 'warning' && value !== 'off') {
        throw new Error(
          `.a11yrc.json rule "${rule}" has invalid severity "${value}". Use "error", "warning", or "off".`
        )
      }
      rules[rule] = value
    }
  }

  const exclude: string[] = []
  if (obj.exclude !== undefined) {
    if (!Array.isArray(obj.exclude) || obj.exclude.some((e) => typeof e !== 'string')) {
      throw new Error(`.a11yrc.json "exclude" must be an array of strings`)
    }
    exclude.push(...(obj.exclude as string[]))
  }

  return { rules, exclude }
}

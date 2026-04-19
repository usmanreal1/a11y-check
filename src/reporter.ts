import chalk from 'chalk'
import type { FileResult } from './engine'

export function report(results: FileResult[]): void {
  let totalIssues = 0

  for (const result of results) {
    if (result.issues.length === 0) continue

    console.log('\n' + chalk.underline(result.filePath))

    for (const issue of result.issues) {
      totalIssues++

      const location = chalk.dim(`${issue.line}:${issue.column}`)
      const severity =
        issue.severity === 'error'
          ? chalk.red('error')
          : chalk.yellow('warning')
      const rule = chalk.dim(`[${issue.rule}]`)

      console.log(`  ${location}  ${severity}  ${issue.message}  ${rule}`)
      console.log(`  ${chalk.dim('→')} ${issue.suggestion}`)
      console.log(`  ${chalk.dim('→')} ${chalk.cyan(issue.wcag)}`)
    }
  }

  console.log('\n' + '─'.repeat(50))

  if (totalIssues === 0) {
    console.log(chalk.green('✓ No accessibility issues found'))
  } else {
    console.log(
      chalk.red(`✖ ${totalIssues} issue${totalIssues > 1 ? 's' : ''} found`)
    )
  }
}
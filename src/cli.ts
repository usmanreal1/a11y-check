#!/usr/bin/env node
import { Command } from 'commander'
import { resolveFiles } from './resolver'
import { parseFile } from './parser'
import { analyzeFiles } from './engine'
import { report } from './reporter'
import { loadConfig } from './config'
import chalk from 'chalk'

const program = new Command()

program
  .name('a11y-analyzer')
  .description('Accessibility analyzer for React JSX/TSX files')
  .version('0.1.0')
  .argument('<path>', 'Path to file or directory to analyze')
  .action(async (inputPath: string) => {
    let config
    try {
      config = loadConfig()
    } catch (err) {
      console.error(chalk.red(`Config error: ${(err as Error).message}`))
      process.exit(1)
    }

    try {
      const files = await resolveFiles(inputPath, config.exclude)
      console.log(chalk.dim(`Analyzing ${files.length} file(s)...\n`))

      const parsed = files.map(parseFile)
      const results = analyzeFiles(parsed, config)
      report(results)

      const hasErrors = results.some((r) =>
        r.issues.some((i) => i.severity === 'error')
      )

      process.exit(hasErrors ? 1 : 0)
    } catch (err) {
      console.error((err as Error).message)
      process.exit(1)
    }
  })

program.parse()

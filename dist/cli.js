#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const resolver_1 = require("./resolver");
const parser_1 = require("./parser");
const engine_1 = require("./engine");
const reporter_1 = require("./reporter");
const config_1 = require("./config");
const chalk_1 = __importDefault(require("chalk"));
const program = new commander_1.Command();
program
    .name('a11y-analyzer')
    .description('Accessibility analyzer for React JSX/TSX files')
    .version('0.1.0')
    .argument('<path>', 'Path to file or directory to analyze')
    .action(async (inputPath) => {
    let config;
    try {
        config = (0, config_1.loadConfig)();
    }
    catch (err) {
        console.error(chalk_1.default.red(`Config error: ${err.message}`));
        process.exit(1);
    }
    try {
        const files = await (0, resolver_1.resolveFiles)(inputPath, config.exclude);
        console.log(chalk_1.default.dim(`Analyzing ${files.length} file(s)...\n`));
        const parsed = files.map(parser_1.parseFile);
        const results = (0, engine_1.analyzeFiles)(parsed, config);
        (0, reporter_1.report)(results);
        const hasErrors = results.some((r) => r.issues.some((i) => i.severity === 'error'));
        process.exit(hasErrors ? 1 : 0);
    }
    catch (err) {
        console.error(err.message);
        process.exit(1);
    }
});
program.parse();

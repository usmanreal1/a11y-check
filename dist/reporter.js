"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.report = report;
const chalk_1 = __importDefault(require("chalk"));
function report(results) {
    let totalIssues = 0;
    for (const result of results) {
        if (result.issues.length === 0)
            continue;
        console.log('\n' + chalk_1.default.underline(result.filePath));
        for (const issue of result.issues) {
            totalIssues++;
            const location = chalk_1.default.dim(`${issue.line}:${issue.column}`);
            const severity = issue.severity === 'error'
                ? chalk_1.default.red('error')
                : chalk_1.default.yellow('warning');
            const rule = chalk_1.default.dim(`[${issue.rule}]`);
            console.log(`  ${location}  ${severity}  ${issue.message}  ${rule}`);
            console.log(`  ${chalk_1.default.dim('→')} ${issue.suggestion}`);
            console.log(`  ${chalk_1.default.dim('→')} ${chalk_1.default.cyan(issue.wcag)}`);
        }
    }
    console.log('\n' + '─'.repeat(50));
    if (totalIssues === 0) {
        console.log(chalk_1.default.green('✓ No accessibility issues found'));
    }
    else {
        console.log(chalk_1.default.red(`✖ ${totalIssues} issue${totalIssues > 1 ? 's' : ''} found`));
    }
}

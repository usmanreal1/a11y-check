"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.headingOrderRule = headingOrderRule;
const traverse_1 = __importDefault(require("@babel/traverse"));
const t = __importStar(require("@babel/types"));
function headingOrderRule(parsed) {
    const issues = [];
    const headings = [];
    (0, traverse_1.default)(parsed.ast, {
        JSXOpeningElement(path) {
            const name = path.node.name;
            if (!t.isJSXIdentifier(name))
                return;
            const match = name.name.match(/^h([1-6])$/);
            if (!match)
                return;
            headings.push({
                level: parseInt(match[1]),
                line: path.node.loc?.start.line ?? 0,
                column: path.node.loc?.start.column ?? 0,
            });
        },
    });
    for (let i = 1; i < headings.length; i++) {
        const prev = headings[i - 1];
        const curr = headings[i];
        if (curr.level > prev.level + 1) {
            issues.push({
                rule: 'heading-order',
                severity: 'warning',
                message: `Heading level skipped: <h${prev.level}> followed by <h${curr.level}>`,
                suggestion: `Use <h${prev.level + 1}> next to maintain a logical heading hierarchy`,
                wcag: 'WCAG 1.3.1 (Level A)',
                line: curr.line,
                column: curr.column,
                filePath: parsed.filePath,
            });
        }
    }
    return issues;
}

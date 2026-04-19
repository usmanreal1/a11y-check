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
exports.interactiveRoleRule = interactiveRoleRule;
const traverse_1 = __importDefault(require("@babel/traverse"));
const t = __importStar(require("@babel/types"));
const NON_INTERACTIVE = new Set([
    'div', 'span', 'p', 'section', 'article', 'aside',
    'main', 'header', 'footer', 'nav', 'li', 'td', 'th',
    'tr', 'table', 'ul', 'ol', 'dl', 'dt', 'dd', 'figure',
    'figcaption', 'blockquote', 'pre', 'h1', 'h2', 'h3',
    'h4', 'h5', 'h6',
]);
function hasAttr(attrs, attrName) {
    return attrs.some((a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === attrName);
}
function interactiveRoleRule(parsed) {
    const issues = [];
    (0, traverse_1.default)(parsed.ast, {
        JSXOpeningElement(path) {
            const name = path.node.name;
            if (!t.isJSXIdentifier(name) || !NON_INTERACTIVE.has(name.name))
                return;
            const attrs = path.node.attributes;
            if (!hasAttr(attrs, 'onClick'))
                return;
            const hasRole = hasAttr(attrs, 'role');
            const hasKeyHandler = hasAttr(attrs, 'onKeyDown') ||
                hasAttr(attrs, 'onKeyUp') ||
                hasAttr(attrs, 'onKeyPress');
            const hasTabIndex = hasAttr(attrs, 'tabIndex');
            if (!hasRole || !hasKeyHandler || !hasTabIndex) {
                const missing = [];
                if (!hasRole)
                    missing.push('role="button" (or appropriate role)');
                if (!hasKeyHandler)
                    missing.push('onKeyDown handler');
                if (!hasTabIndex)
                    missing.push('tabIndex={0}');
                issues.push({
                    rule: 'interactive-role',
                    severity: 'error',
                    message: `<${name.name}> has onClick but is not keyboard accessible`,
                    suggestion: `Add ${missing.join(', ')}. Or replace with a <button> element.`,
                    wcag: 'WCAG 2.1.1 (Level A)',
                    line: path.node.loc?.start.line ?? 0,
                    column: path.node.loc?.start.column ?? 0,
                    filePath: parsed.filePath,
                });
            }
        },
    });
    return issues;
}

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
exports.linkTextRule = linkTextRule;
const traverse_1 = __importDefault(require("@babel/traverse"));
const t = __importStar(require("@babel/types"));
const NON_DESCRIPTIVE = new Set([
    'click here', 'here', 'read more', 'more', 'link', 'this',
    'learn more', 'click', 'tap here', 'go', 'continue', 'details',
    'info', 'information', 'see more', 'view more', 'view', 'open',
]);
function hasDynamicContent(children) {
    for (const child of children) {
        if (t.isJSXExpressionContainer(child) && !t.isJSXEmptyExpression(child.expression))
            return true;
        if (t.isJSXElement(child) && hasDynamicContent(child.children))
            return true;
    }
    return false;
}
function extractText(children) {
    let text = '';
    for (const child of children) {
        if (t.isJSXText(child)) {
            text += child.value.trim();
        }
        else if (t.isJSXElement(child)) {
            const name = child.openingElement.name;
            if (t.isJSXIdentifier(name) && name.name === 'img') {
                const altAttr = child.openingElement.attributes.find((a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === 'alt');
                if (altAttr && t.isJSXAttribute(altAttr) && t.isStringLiteral(altAttr.value)) {
                    text += altAttr.value.value.trim();
                }
            }
            else {
                text += extractText(child.children);
            }
        }
    }
    return text;
}
function linkTextRule(parsed) {
    const issues = [];
    (0, traverse_1.default)(parsed.ast, {
        JSXOpeningElement(path) {
            const name = path.node.name;
            if (!t.isJSXIdentifier(name) || name.name !== 'a')
                return;
            const attrs = path.node.attributes;
            const hasAriaLabel = attrs.some((a) => t.isJSXAttribute(a) &&
                t.isJSXIdentifier(a.name) &&
                (a.name.name === 'aria-label' || a.name.name === 'aria-labelledby') &&
                a.value !== null);
            if (hasAriaLabel)
                return;
            const element = path.parent;
            if (hasDynamicContent(element.children))
                return;
            const text = extractText(element.children).toLowerCase();
            if (text.length === 0) {
                issues.push({
                    rule: 'link-text',
                    severity: 'error',
                    message: '<a> has no accessible text',
                    suggestion: 'Add descriptive text content or aria-label="..." to the link',
                    wcag: 'WCAG 2.4.6 (Level AA)',
                    line: path.node.loc?.start.line ?? 0,
                    column: path.node.loc?.start.column ?? 0,
                    filePath: parsed.filePath,
                });
                return;
            }
            if (NON_DESCRIPTIVE.has(text)) {
                issues.push({
                    rule: 'link-text',
                    severity: 'warning',
                    message: `<a> has non-descriptive text: "${text}"`,
                    suggestion: 'Use text that describes the destination or purpose, e.g. "Read our accessibility guide"',
                    wcag: 'WCAG 2.4.6 (Level AA)',
                    line: path.node.loc?.start.line ?? 0,
                    column: path.node.loc?.start.column ?? 0,
                    filePath: parsed.filePath,
                });
            }
        },
    });
    return issues;
}

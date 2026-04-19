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
exports.linkHrefRule = linkHrefRule;
const traverse_1 = __importDefault(require("@babel/traverse"));
const t = __importStar(require("@babel/types"));
function linkHrefRule(parsed) {
    const issues = [];
    (0, traverse_1.default)(parsed.ast, {
        JSXOpeningElement(path) {
            const name = path.node.name;
            if (!t.isJSXIdentifier(name) || name.name !== 'a')
                return;
            const attrs = path.node.attributes;
            const hrefAttr = attrs.find((a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === 'href');
            if (!hrefAttr) {
                issues.push({
                    rule: 'link-href',
                    severity: 'error',
                    message: '<a> is missing an href attribute',
                    suggestion: 'Add href="..." with a valid URL, or use a <button> if this is a click action',
                    wcag: 'WCAG 2.4.1 (Level A)',
                    line: path.node.loc?.start.line ?? 0,
                    column: path.node.loc?.start.column ?? 0,
                    filePath: parsed.filePath,
                });
                return;
            }
            if (!t.isJSXAttribute(hrefAttr) || !t.isStringLiteral(hrefAttr.value))
                return;
            const href = hrefAttr.value.value.trim();
            if (href === '') {
                issues.push({
                    rule: 'link-href',
                    severity: 'error',
                    message: '<a> has an empty href attribute',
                    suggestion: 'Provide a valid URL or use a <button> for in-page actions',
                    wcag: 'WCAG 2.4.1 (Level A)',
                    line: path.node.loc?.start.line ?? 0,
                    column: path.node.loc?.start.column ?? 0,
                    filePath: parsed.filePath,
                });
                return;
            }
            if (href === '#') {
                issues.push({
                    rule: 'link-href',
                    severity: 'warning',
                    message: '<a href="#"> does not navigate anywhere',
                    suggestion: 'Use a real URL, an anchor id (href="#section"), or replace with a <button>',
                    wcag: 'WCAG 2.4.1 (Level A)',
                    line: path.node.loc?.start.line ?? 0,
                    column: path.node.loc?.start.column ?? 0,
                    filePath: parsed.filePath,
                });
            }
        },
    });
    return issues;
}

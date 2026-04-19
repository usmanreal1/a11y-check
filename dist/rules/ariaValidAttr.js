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
exports.ariaValidAttrRule = ariaValidAttrRule;
const traverse_1 = __importDefault(require("@babel/traverse"));
const t = __importStar(require("@babel/types"));
const VALID_ARIA_ATTRS = new Set([
    'aria-activedescendant', 'aria-atomic', 'aria-autocomplete', 'aria-busy',
    'aria-checked', 'aria-colcount', 'aria-colindex', 'aria-colspan',
    'aria-controls', 'aria-current', 'aria-describedby', 'aria-details',
    'aria-disabled', 'aria-dropeffect', 'aria-errormessage', 'aria-expanded',
    'aria-flowto', 'aria-grabbed', 'aria-haspopup', 'aria-hidden',
    'aria-invalid', 'aria-keyshortcuts', 'aria-label', 'aria-labelledby',
    'aria-level', 'aria-live', 'aria-modal', 'aria-multiline',
    'aria-multiselectable', 'aria-orientation', 'aria-owns', 'aria-placeholder',
    'aria-posinset', 'aria-pressed', 'aria-readonly', 'aria-relevant',
    'aria-required', 'aria-roledescription', 'aria-rowcount', 'aria-rowindex',
    'aria-rowspan', 'aria-selected', 'aria-setsize', 'aria-sort',
    'aria-valuemax', 'aria-valuemin', 'aria-valuenow', 'aria-valuetext',
]);
function ariaValidAttrRule(parsed) {
    const issues = [];
    (0, traverse_1.default)(parsed.ast, {
        JSXOpeningElement(path) {
            for (const attr of path.node.attributes) {
                if (!t.isJSXAttribute(attr))
                    continue;
                if (!t.isJSXIdentifier(attr.name))
                    continue;
                const attrName = attr.name.name;
                if (!attrName.startsWith('aria-'))
                    continue;
                if (!VALID_ARIA_ATTRS.has(attrName)) {
                    issues.push({
                        rule: 'aria-valid-attr',
                        severity: 'error',
                        message: `"${attrName}" is not a valid ARIA attribute`,
                        suggestion: `Check the ARIA spec for the correct attribute name. Valid attributes include aria-label, aria-labelledby, aria-hidden, etc.`,
                        wcag: 'WCAG 4.1.2 (Level A)',
                        line: attr.loc?.start.line ?? 0,
                        column: attr.loc?.start.column ?? 0,
                        filePath: parsed.filePath,
                    });
                }
            }
        },
    });
    return issues;
}

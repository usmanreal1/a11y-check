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
exports.altTextRule = altTextRule;
const traverse_1 = __importDefault(require("@babel/traverse"));
const t = __importStar(require("@babel/types"));
function altTextRule(parsed) {
    const issues = [];
    (0, traverse_1.default)(parsed.ast, {
        JSXOpeningElement(path) {
            const name = path.node.name;
            // only check <img> elements
            if (!t.isJSXIdentifier(name) || name.name !== 'img')
                return;
            const attrs = path.node.attributes;
            const altAttr = attrs.find((attr) => t.isJSXAttribute(attr) &&
                t.isJSXIdentifier(attr.name) &&
                attr.name.name === 'alt');
            // no alt attribute at all
            if (!altAttr) {
                issues.push({
                    rule: 'alt-text',
                    severity: 'error',
                    message: '<img> is missing an alt attribute',
                    suggestion: 'Add alt="" for decorative images, or alt="description" for informative ones',
                    wcag: 'WCAG 1.1.1 (Level A)',
                    line: path.node.loc?.start.line ?? 0,
                    column: path.node.loc?.start.column ?? 0,
                    filePath: parsed.filePath,
                });
                return;
            }
            // alt attribute exists but value is undefined (alt with no value)
            if (t.isJSXAttribute(altAttr) &&
                altAttr.value === null) {
                issues.push({
                    rule: 'alt-text',
                    severity: 'error',
                    message: '<img> has alt attribute with no value',
                    suggestion: 'Use alt="" for decorative images or provide a meaningful description',
                    wcag: 'WCAG 1.1.1 (Level A)',
                    line: path.node.loc?.start.line ?? 0,
                    column: path.node.loc?.start.column ?? 0,
                    filePath: parsed.filePath,
                });
            }
        },
    });
    return issues;
}

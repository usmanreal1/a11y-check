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
exports.iframeTitleRule = iframeTitleRule;
const traverse_1 = __importDefault(require("@babel/traverse"));
const t = __importStar(require("@babel/types"));
function iframeTitleRule(parsed) {
    const issues = [];
    (0, traverse_1.default)(parsed.ast, {
        JSXOpeningElement(path) {
            const name = path.node.name;
            if (!t.isJSXIdentifier(name) || name.name !== 'iframe')
                return;
            const attrs = path.node.attributes;
            const titleAttr = attrs.find((a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === 'title');
            if (!titleAttr) {
                issues.push({
                    rule: 'iframe-title',
                    severity: 'error',
                    message: '<iframe> is missing a title attribute',
                    suggestion: 'Add title="..." describing the iframe content, e.g. title="Google Maps"',
                    wcag: 'WCAG 4.1.2 (Level A)',
                    line: path.node.loc?.start.line ?? 0,
                    column: path.node.loc?.start.column ?? 0,
                    filePath: parsed.filePath,
                });
                return;
            }
            if (t.isJSXAttribute(titleAttr) &&
                t.isStringLiteral(titleAttr.value) &&
                titleAttr.value.value.trim().length === 0) {
                issues.push({
                    rule: 'iframe-title',
                    severity: 'error',
                    message: '<iframe> has an empty title attribute',
                    suggestion: 'Provide a meaningful title that describes the iframe content',
                    wcag: 'WCAG 4.1.2 (Level A)',
                    line: path.node.loc?.start.line ?? 0,
                    column: path.node.loc?.start.column ?? 0,
                    filePath: parsed.filePath,
                });
            }
        },
    });
    return issues;
}

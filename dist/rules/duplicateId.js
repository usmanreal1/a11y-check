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
exports.duplicateIdRule = duplicateIdRule;
const traverse_1 = __importDefault(require("@babel/traverse"));
const t = __importStar(require("@babel/types"));
function duplicateIdRule(parsed) {
    const issues = [];
    const seen = new Map();
    (0, traverse_1.default)(parsed.ast, {
        JSXOpeningElement(path) {
            const idAttr = path.node.attributes.find((a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === 'id');
            if (!idAttr || !t.isJSXAttribute(idAttr))
                return;
            if (!t.isStringLiteral(idAttr.value))
                return;
            const id = idAttr.value.value;
            if (!seen.has(id))
                seen.set(id, []);
            seen.get(id).push({
                line: path.node.loc?.start.line ?? 0,
                column: path.node.loc?.start.column ?? 0,
            });
        },
    });
    for (const [id, locations] of seen) {
        if (locations.length < 2)
            continue;
        for (const loc of locations) {
            issues.push({
                rule: 'duplicate-id',
                severity: 'error',
                message: `Duplicate id="${id}" — id values must be unique within a document`,
                suggestion: 'Give each element a unique id. If rendering a list, append the item index or a unique key.',
                wcag: 'WCAG 4.1.1 (Level A)',
                line: loc.line,
                column: loc.column,
                filePath: parsed.filePath,
            });
        }
    }
    return issues;
}

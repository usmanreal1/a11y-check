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
exports.tableHeadersRule = tableHeadersRule;
const traverse_1 = __importDefault(require("@babel/traverse"));
const t = __importStar(require("@babel/types"));
function findJSXByTag(children, tagName) {
    for (const child of children) {
        if (!t.isJSXElement(child))
            continue;
        const name = child.openingElement.name;
        if (t.isJSXIdentifier(name) && name.name === tagName)
            return true;
        if (findJSXByTag(child.children, tagName))
            return true;
    }
    return false;
}
function tableHeadersRule(parsed) {
    const issues = [];
    (0, traverse_1.default)(parsed.ast, {
        JSXOpeningElement(path) {
            const name = path.node.name;
            if (!t.isJSXIdentifier(name) || name.name !== 'table')
                return;
            if (!t.isJSXElement(path.parent))
                return;
            const children = path.parent.children;
            // Only flag tables that have data cells — layout tables may have neither
            const hasTd = findJSXByTag(children, 'td');
            if (!hasTd)
                return;
            const hasTh = findJSXByTag(children, 'th');
            if (hasTh)
                return;
            issues.push({
                rule: 'table-headers',
                severity: 'error',
                message: '<table> has data cells (<td>) but no header cells (<th>)',
                suggestion: 'Add <th> elements in the first row or column with appropriate scope="col" or scope="row" so screen readers can associate data cells with their headers.',
                wcag: 'WCAG 1.3.1 (Level A)',
                line: path.node.loc?.start.line ?? 0,
                column: path.node.loc?.start.column ?? 0,
                filePath: parsed.filePath,
            });
        },
    });
    return issues;
}

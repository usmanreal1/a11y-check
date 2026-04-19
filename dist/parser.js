"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFile = parseFile;
const parser_1 = require("@babel/parser");
const fs_1 = __importDefault(require("fs"));
function parseFile(filePath) {
    const source = fs_1.default.readFileSync(filePath, 'utf-8');
    const ast = (0, parser_1.parse)(source, {
        sourceType: 'module',
        plugins: [
            'jsx',
            'typescript',
            'decorators-legacy',
            'classProperties',
        ],
        errorRecovery: true,
    });
    return { filePath, ast, source };
}

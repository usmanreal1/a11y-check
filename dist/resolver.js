"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveFiles = resolveFiles;
const glob_1 = require("glob");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
async function resolveFiles(inputPath, exclude = []) {
    const normalized = path_1.default.resolve(inputPath);
    // single file passed directly
    if (fs_1.default.existsSync(normalized) && fs_1.default.statSync(normalized).isFile()) {
        if (!/\.(jsx|tsx)$/.test(normalized)) {
            throw new Error(`File must be a .jsx or .tsx file: ${inputPath}`);
        }
        return [normalized];
    }
    const files = await (0, glob_1.glob)(`${normalized}/**/*.{jsx,tsx}`, {
        ignore: [
            '**/node_modules/**',
            '**/dist/**',
            '**/*.test.*',
            '**/*.spec.*',
            ...exclude,
        ],
    });
    if (files.length === 0) {
        throw new Error(`No JSX/TSX files found in: ${inputPath}`);
    }
    return files.sort();
}

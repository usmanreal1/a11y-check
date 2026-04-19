"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DEFAULTS = {
    rules: {},
    exclude: [],
};
function loadConfig(cwd = process.cwd()) {
    const configPath = path_1.default.join(cwd, '.a11yrc.json');
    if (!fs_1.default.existsSync(configPath))
        return DEFAULTS;
    let raw;
    try {
        raw = JSON.parse(fs_1.default.readFileSync(configPath, 'utf-8'));
    }
    catch {
        throw new Error(`Could not parse .a11yrc.json — make sure it is valid JSON`);
    }
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
        throw new Error(`.a11yrc.json must be a JSON object`);
    }
    const obj = raw;
    const rules = {};
    if (obj.rules !== undefined) {
        if (typeof obj.rules !== 'object' || obj.rules === null || Array.isArray(obj.rules)) {
            throw new Error(`.a11yrc.json "rules" must be an object`);
        }
        for (const [rule, value] of Object.entries(obj.rules)) {
            if (value !== 'error' && value !== 'warning' && value !== 'off') {
                throw new Error(`.a11yrc.json rule "${rule}" has invalid severity "${value}". Use "error", "warning", or "off".`);
            }
            rules[rule] = value;
        }
    }
    const exclude = [];
    if (obj.exclude !== undefined) {
        if (!Array.isArray(obj.exclude) || obj.exclude.some((e) => typeof e !== 'string')) {
            throw new Error(`.a11yrc.json "exclude" must be an array of strings`);
        }
        exclude.push(...obj.exclude);
    }
    return { rules, exclude };
}

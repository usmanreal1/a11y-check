"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeFiles = analyzeFiles;
const index_1 = require("./rules/index");
const filter_1 = require("./filter");
const EMPTY_CONFIG = { rules: {}, exclude: [] };
function analyzeFiles(parsedFiles, config = EMPTY_CONFIG) {
    return parsedFiles.map((parsed) => {
        let issues = (0, index_1.runAllRules)(parsed);
        issues = (0, filter_1.applyIgnoreComments)(issues, parsed.source);
        issues = (0, filter_1.applyConfigRules)(issues, config.rules);
        return { filePath: parsed.filePath, issues };
    });
}

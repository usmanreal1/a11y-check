"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAllRules = runAllRules;
const altText_1 = require("./altText");
const buttonLabel_1 = require("./buttonLabel");
const inputLabel_1 = require("./inputLabel");
const selectLabel_1 = require("./selectLabel");
const textareaLabel_1 = require("./textareaLabel");
const linkText_1 = require("./linkText");
const interactiveRole_1 = require("./interactiveRole");
const ariaValidAttr_1 = require("./ariaValidAttr");
const ariaHiddenFocus_1 = require("./ariaHiddenFocus");
const langAttribute_1 = require("./langAttribute");
const headingOrder_1 = require("./headingOrder");
const linkHref_1 = require("./linkHref");
const iframeTitle_1 = require("./iframeTitle");
const autoplayMedia_1 = require("./autoplayMedia");
const videoCaptions_1 = require("./videoCaptions");
const tabIndex_1 = require("./tabIndex");
const duplicateId_1 = require("./duplicateId");
const tableCaptions_1 = require("./tableCaptions");
const tableHeaders_1 = require("./tableHeaders");
function runAllRules(parsed) {
    return [
        // WCAG 1.1.1 — Non-text Content
        ...(0, altText_1.altTextRule)(parsed),
        // WCAG 1.2.2 — Captions (Prerecorded)
        ...(0, videoCaptions_1.videoCaptionsRule)(parsed),
        // WCAG 1.3.1 — Info and Relationships
        ...(0, headingOrder_1.headingOrderRule)(parsed),
        ...(0, inputLabel_1.inputLabelRule)(parsed),
        ...(0, selectLabel_1.selectLabelRule)(parsed),
        ...(0, textareaLabel_1.textareaLabelRule)(parsed),
        ...(0, tableCaptions_1.tableCaptionsRule)(parsed),
        ...(0, tableHeaders_1.tableHeadersRule)(parsed),
        // WCAG 1.4.2 — Audio Control
        ...(0, autoplayMedia_1.autoplayMediaRule)(parsed),
        // WCAG 2.1.1 — Keyboard
        ...(0, interactiveRole_1.interactiveRoleRule)(parsed),
        // WCAG 2.4.1 — Bypass Blocks
        ...(0, iframeTitle_1.iframeTitleRule)(parsed),
        // WCAG 2.4.3 — Focus Order
        ...(0, tabIndex_1.tabIndexRule)(parsed),
        // WCAG 2.4.4 — Link Purpose
        ...(0, linkText_1.linkTextRule)(parsed),
        ...(0, linkHref_1.linkHrefRule)(parsed),
        // WCAG 3.1.1 — Language of Page
        ...(0, langAttribute_1.langAttributeRule)(parsed),
        // WCAG 4.1.1 — Parsing
        ...(0, duplicateId_1.duplicateIdRule)(parsed),
        // WCAG 4.1.2 — Name, Role, Value
        ...(0, buttonLabel_1.buttonLabelRule)(parsed),
        ...(0, ariaValidAttr_1.ariaValidAttrRule)(parsed),
        ...(0, ariaHiddenFocus_1.ariaHiddenFocusRule)(parsed),
    ];
}

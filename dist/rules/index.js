"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAllRules = runAllRules;
const altText_1 = require("./altText");
const buttonLabel_1 = require("./buttonLabel");
const inputLabel_1 = require("./inputLabel");
const linkText_1 = require("./linkText");
const interactiveRole_1 = require("./interactiveRole");
const ariaValidAttr_1 = require("./ariaValidAttr");
const langAttribute_1 = require("./langAttribute");
const headingOrder_1 = require("./headingOrder");
const linkHref_1 = require("./linkHref");
const iframeTitle_1 = require("./iframeTitle");
const autoplayMedia_1 = require("./autoplayMedia");
function runAllRules(parsed) {
    return [
        // Level A
        ...(0, altText_1.altTextRule)(parsed),
        ...(0, buttonLabel_1.buttonLabelRule)(parsed),
        ...(0, inputLabel_1.inputLabelRule)(parsed),
        ...(0, linkText_1.linkTextRule)(parsed),
        ...(0, interactiveRole_1.interactiveRoleRule)(parsed),
        ...(0, ariaValidAttr_1.ariaValidAttrRule)(parsed),
        ...(0, langAttribute_1.langAttributeRule)(parsed),
        // Level AA
        ...(0, headingOrder_1.headingOrderRule)(parsed),
        ...(0, linkHref_1.linkHrefRule)(parsed),
        ...(0, iframeTitle_1.iframeTitleRule)(parsed),
        ...(0, autoplayMedia_1.autoplayMediaRule)(parsed),
    ];
}

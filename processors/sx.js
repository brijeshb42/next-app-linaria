"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.generateSxCss = generateSxCss;
exports.getTheme = getTheme;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _tags = require("@linaria/tags");
var _styles = require("@mui/material/styles");
var _styleFunctionSx = _interopRequireWildcard(require("@mui/system/styleFunctionSx"));
var _css = require("@emotion/css");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function getTheme(theme, prefix = '') {
  const sxConfig = (0, _extends2.default)({}, _styleFunctionSx.unstable_defaultSxConfig, (theme != null ? theme : {}).unstable_sxConfig);
  Object.keys(sxConfig).forEach(configKey => {
    let value = sxConfig[configKey];
    if (value.themeKey === 'palette' && value.transform) {
      value = (0, _extends2.default)({}, value, {
        transform: (cssValue, userValue) => {
          if (cssValue === userValue) {
            return cssValue;
          }
          if (typeof userValue === 'string' && !userValue.startsWith('rgb') && userValue.includes('.')) {
            return [cssValue, `var(--${prefix ? `${prefix}-` : ''}palette-${userValue.split('.').join('-')}, ${cssValue})`];
          }
          return cssValue;
        }
      });
      sxConfig[configKey] = value;
    }
  });
  if (!theme) {
    const newTheme = (0, _styles.createTheme)({
      unstable_sxConfig: sxConfig
    });
    return newTheme;
  }
  theme.unstable_sxConfig = sxConfig;
  return theme;
}
function generateSxCss(inputObj, theme, darkTheme) {
  const cssObj = (0, _styleFunctionSx.default)({
    sx: typeof inputObj === 'function' ? inputObj({
      theme,
      darkTheme
    }) : inputObj,
    theme
  });
  if (typeof cssObj === 'string') {
    return cssObj;
  }
  const resultClass = (0, _css.css)([cssObj]);
  const finalCss = _css.cache.registered[resultClass];
  if (typeof finalCss === 'boolean') {
    return '';
  }
  return finalCss;
}
class SxReplacerProcessor extends _tags.BaseProcessor {
  constructor([callee, callParam], ...args) {
    const source = args[0];
    (0, _tags.validateParams)([callee, callParam], ['callee', 'call'], `Invalid usage of \`${source.imported}\` tag`);
    super([callee], ...args);

    // 0 -> import path and name
    // 1 -> astservice
    // 2 -> identifier sx
    // 3 -> replacer
    // 4 -> Identifier name
    // 5 -> boolean true
    // 6 -> some number
    // 7 -> plugin options
    // 8 -> babel config
    this.expressionName = null;
    this.theme = void 0;
    this.darkTheme = void 0;
    this.prefix = void 0;
    const presetConfig = args[7];
    this.theme = presetConfig.theme;
    this.darkTheme = presetConfig.darkTheme;
    this.prefix = presetConfig.prefix;
    if (callParam[0] === 'call') {
      const {
        ex
      } = callParam[1];
      if (ex.type === 'Identifier') {
        this.expressionName = ex.name;
      } else if (ex.type === 'NullLiteral') {
        this.expressionName = null;
      } else {
        this.expressionName = ex.value;
      }
    }
  }
  get asSelector() {
    return `.${this.className}`;
  }
  build(values) {
    var _this$location, _this$location$start$, _this$location2, _this$location$start$2, _this$location3, _this$location$end$co, _this$location4, _this$location$end$li, _this$location5;
    const theme = getTheme(this.theme, this.prefix);
    const darkTheme = getTheme(this.darkTheme, this.prefix);
    const cssText = generateSxCss(values.get(this.expressionName), theme, darkTheme);
    const cssRules = {
      [this.asSelector]: {
        className: this.className,
        cssText,
        displayName: this.displayName,
        start: (_this$location = this.location) == null ? void 0 : _this$location.start
      }
    };
    // @TODO - Refine later
    const sourceMapReplacements = [{
      length: cssText.length,
      original: {
        start: {
          column: (_this$location$start$ = (_this$location2 = this.location) == null ? void 0 : _this$location2.start.column) != null ? _this$location$start$ : 0,
          line: (_this$location$start$2 = (_this$location3 = this.location) == null ? void 0 : _this$location3.start.line) != null ? _this$location$start$2 : 0
        },
        end: {
          column: (_this$location$end$co = (_this$location4 = this.location) == null ? void 0 : _this$location4.end.column) != null ? _this$location$end$co : 0,
          line: (_this$location$end$li = (_this$location5 = this.location) == null ? void 0 : _this$location5.end.line) != null ? _this$location$end$li : 0
        }
      }
    }];
    this.artifacts.push(['css', [cssRules, sourceMapReplacements]]);
  }
  doEvaltimeReplacement() {
    this.replacer(this.value, false);
  }
  doRuntimeReplacement() {
    this.replacer(this.value, false);
  }
  get value() {
    return this.astService.stringLiteral(this.className);
  }
}
exports.default = SxReplacerProcessor;
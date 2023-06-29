"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _tags = require("@linaria/tags");
var _styled = _interopRequireDefault(require("@linaria/react/processors/styled"));
var _sx = require("./sx");
const isNotNull = x => x !== null;
const singleQuotedStringLiteral = value => ({
  type: 'StringLiteral',
  value,
  extra: {
    rawValue: value,
    raw: `'${value}'`
  }
});
class StyledProcessor extends _tags.BaseProcessor {
  constructor(params, ...args) {
    const lastParam = params[params.length - 1];
    super(params, ...args);
    this.params = params;
    this.templateProcessor = void 0;
    this.component = void 0;
    if (lastParam[0] === 'template') {
      this.templateProcessor = new _styled.default(params, ...args);
      this.dependencies.push(...this.templateProcessor.dependencies);
    } else {
      this.templateProcessor = null;
      (0, _tags.validateParams)(params, ['callee', ['call', 'member'], 'call'], `Invalid usage of \`${this.tagSource.imported}\` tag`);
      this.init();
    }
  }
  init() {
    const [, tagOp] = this.params;
    let component;
    if (tagOp[0] === 'call' && tagOp.length <= 3) {
      const value = tagOp[1];
      if (value.kind === _tags.ValueType.FUNCTION) {
        component = 'FunctionalComponent';
      } else if (value.kind === _tags.ValueType.CONST) {
        component = typeof value.value === 'string' ? value.value : undefined;
      } else {
        component = {
          node: value.ex,
          source: value.source
        };
        this.dependencies.push(value);
      }
    }
    if (tagOp[0] === 'member') {
      component = tagOp[1];
    }
    if (!component) {
      throw new Error(`Invalid usage of \`${this.tagSource.imported}\` tag`);
    }
    this.component = component;
  }
  build(values) {
    if (this.templateProcessor) {
      this.templateProcessor.build(values);
      this.artifacts.push(...this.templateProcessor.artifacts);
    } else {
      var _this$location, _this$location$start$, _this$location2, _this$location$start$2, _this$location3, _this$location$end$co, _this$location4, _this$location$end$li, _this$location5;
      const [,, [, callOp]] = this.params;
      if (typeof callOp === 'string' || !('kind' in callOp)) {
        return;
      }
      if (callOp.ex.type !== 'Identifier') {
        console.warn(`Found ${callOp.ex.type}. It's not supported yet.`);
        return;
      }
      const opts = this.options;
      const theme = (0, _sx.getTheme)(opts.theme, opts.prefix);
      const darkTheme = (0, _sx.getTheme)(opts.darkTheme, opts.prefix);
      const cssText = (0, _sx.generateSxCss)(values.get(callOp.ex.name), theme, darkTheme);
      const cssRules = {
        [this.asSelector]: {
          className: this.className,
          cssText,
          displayName: this.displayName,
          start: (_this$location = this.location) == null ? void 0 : _this$location.start
        }
      };

      // @TODO - Refine exact source location later.
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
  }
  doEvaltimeReplacement() {
    if (this.templateProcessor) {
      this.templateProcessor.doEvaltimeReplacement();
      return;
    }
    this.replacer(this.value, false);
  }
  getProps() {
    const props = {
      name: this.displayName,
      class: this.className,
      // @TODO - Confirm behaviour with default styled processor
      propsAsIs: typeof this.component !== 'string'
    };
    return props;
  }
  get tagExpressionArgument() {
    const t = this.astService;
    if (typeof this.component === 'string') {
      if (this.component === 'FunctionalComponent') {
        return t.arrowFunctionExpression([], t.blockStatement([]));
      }
      return singleQuotedStringLiteral(this.component);
    }
    if (!this.component) {
      throw new Error('Could not identify component name');
    }
    return t.callExpression(t.identifier(this.component.node.name), []);
  }
  get tagExpression() {
    const t = this.astService;
    return t.callExpression(this.callee, [this.tagExpressionArgument]);
  }
  getTagComponentProps(props) {
    const t = this.astService;
    const propExpressions = Object.entries(props).map(([key, value]) => {
      if (value === undefined) {
        return null;
      }
      const keyNode = t.identifier(key);
      if (value === null) {
        return t.objectProperty(keyNode, t.nullLiteral());
      }
      if (typeof value === 'string') {
        return t.objectProperty(keyNode, t.stringLiteral(value));
      }
      if (typeof value === 'boolean') {
        return t.objectProperty(keyNode, t.booleanLiteral(value));
      }
      const vars = Object.entries(value).map(([propName, propValue]) => {
        return t.objectProperty(t.stringLiteral(propName), t.arrayExpression(propValue));
      });
      return t.objectProperty(keyNode, t.objectExpression(vars));
    }).filter(isNotNull);
    return t.objectExpression(propExpressions);
  }
  doRuntimeReplacement() {
    if (this.templateProcessor) {
      this.templateProcessor.doRuntimeReplacement();
      return;
    }
    const t = this.astService;
    const props = this.getProps();
    this.replacer(t.callExpression(this.tagExpression, [this.getTagComponentProps(props)]), true);
  }
  get asSelector() {
    if (this.templateProcessor) {
      return this.templateProcessor.asSelector;
    }
    return `.${this.className}`;
    // throw new Error("Method not implemented.");
  }

  get value() {
    var _this$component;
    if (this.templateProcessor) {
      return this.templateProcessor.value;
    }
    const t = this.astService;
    const extendsNode = typeof this.component === 'string' ? null : (_this$component = this.component) == null ? void 0 : _this$component.node.name;
    return t.objectExpression([t.objectProperty(t.stringLiteral('displayName'), t.stringLiteral(this.displayName)), t.objectProperty(t.stringLiteral('__linaria'), t.objectExpression([t.objectProperty(t.stringLiteral('className'), t.stringLiteral(this.className)), t.objectProperty(t.stringLiteral('extends'), extendsNode ? t.callExpression(t.identifier(extendsNode), []) : t.nullLiteral())]))]);
    // throw new Error("Method not implemented.");
  }
}
exports.default = StyledProcessor;
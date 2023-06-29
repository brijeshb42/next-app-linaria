import { CallExpression, StringLiteral, ObjectExpression } from '@babel/types';
import type {
  Expression,
  ValueCache,
  Params,
  TailProcessorParams,
  Rules,
  Replacements,
  WrappedNode,
} from '@linaria/tags';
import type { CSSObject } from '@emotion/serialize';
import { BaseProcessor, validateParams, ValueType } from '@linaria/tags';
import TemplateStyledProcessor, { IProps } from '@linaria/react/processors/styled';

import type { SxConfig } from '@mui/system';
import { generateSxCss, getTheme, type ICustomOptions } from './sx';

const isNotNull = <T>(x: T | null): x is T => x !== null;
const singleQuotedStringLiteral = (value: string): StringLiteral => ({
  type: 'StringLiteral',
  value,
  extra: {
    rawValue: value,
    raw: `'${value}'`,
  },
});

export default class StyledProcessor<
  T extends {
    unstable_sxConfig?: SxConfig;
  },
> extends BaseProcessor {
  templateProcessor: TemplateStyledProcessor | null;

  component?: WrappedNode;

  constructor(private params: Params, ...args: TailProcessorParams) {
    const lastParam = params[params.length - 1];
    super(params, ...args);

    if (lastParam[0] === 'template') {
      this.templateProcessor = new TemplateStyledProcessor(params, ...args);
      this.dependencies.push(...this.templateProcessor.dependencies);
    } else {
      this.templateProcessor = null;
      validateParams(
        params,
        ['callee', ['call', 'member'], 'call'],
        `Invalid usage of \`${this.tagSource.imported}\` tag`,
      );
      this.init();
    }
  }

  private init() {
    const [, tagOp] = this.params;
    let component: WrappedNode | undefined;
    if (tagOp[0] === 'call' && tagOp.length <= 3) {
      const value = tagOp[1];
      if (value.kind === ValueType.FUNCTION) {
        component = 'FunctionalComponent';
      } else if (value.kind === ValueType.CONST) {
        component = typeof value.value === 'string' ? value.value : undefined;
      } else {
        component = {
          node: value.ex,
          source: value.source,
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

  build(values: ValueCache): void {
    if (this.templateProcessor) {
      this.templateProcessor.build(values);
      this.artifacts.push(...this.templateProcessor.artifacts);
    } else {
      const [, , [, callOp]] = this.params;
      if (typeof callOp === 'string' || !('kind' in callOp)) {
        return;
      }
      if (callOp.ex.type !== 'Identifier') {
        console.warn(`Found ${callOp.ex.type}. It's not supported yet.`);
        return;
      }
      const opts = this.options as ICustomOptions<T>;
      const theme = getTheme(opts.theme, opts.prefix);
      const darkTheme = getTheme(opts.darkTheme, opts.prefix);
      const cssText = generateSxCss(values.get(callOp.ex.name) as CSSObject, theme, darkTheme);

      const cssRules: Rules = {
        [this.asSelector]: {
          className: this.className,
          cssText,
          displayName: this.displayName,
          start: this.location?.start,
        },
      };

      // @TODO - Refine exact source location later.
      const sourceMapReplacements: Replacements = [
        {
          length: cssText.length,
          original: {
            start: {
              column: this.location?.start.column ?? 0,
              line: this.location?.start.line ?? 0,
            },
            end: {
              column: this.location?.end.column ?? 0,
              line: this.location?.end.line ?? 0,
            },
          },
        },
      ];
      this.artifacts.push(['css', [cssRules, sourceMapReplacements]]);
    }
  }

  doEvaltimeReplacement(): void {
    if (this.templateProcessor) {
      this.templateProcessor.doEvaltimeReplacement();
      return;
    }
    this.replacer(this.value, false);
  }

  private getProps(): IProps {
    const props: IProps = {
      name: this.displayName,
      class: this.className,
      // @TODO - Confirm behaviour with default styled processor
      propsAsIs: typeof this.component !== 'string',
    };

    return props;
  }

  protected get tagExpressionArgument(): Expression {
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

  protected get tagExpression(): CallExpression {
    const t = this.astService;
    return t.callExpression(this.callee, [this.tagExpressionArgument]);
  }

  protected getTagComponentProps(props: IProps): ObjectExpression {
    const t = this.astService;

    const propExpressions = Object.entries(props)
      .map(([key, value]: [key: string, value: IProps[keyof IProps]]) => {
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
      })
      .filter(isNotNull);

    return t.objectExpression(propExpressions);
  }

  doRuntimeReplacement(): void {
    if (this.templateProcessor) {
      this.templateProcessor.doRuntimeReplacement();
      return;
    }
    const t = this.astService;
    const props = this.getProps();
    this.replacer(t.callExpression(this.tagExpression, [this.getTagComponentProps(props)]), true);
  }

  get asSelector(): string {
    if (this.templateProcessor) {
      return this.templateProcessor.asSelector;
    }
    return `.${this.className}`;
    // throw new Error("Method not implemented.");
  }

  get value(): Expression {
    if (this.templateProcessor) {
      return this.templateProcessor.value;
    }
    const t = this.astService;
    const extendsNode = typeof this.component === 'string' ? null : this.component?.node.name;

    return t.objectExpression([
      t.objectProperty(t.stringLiteral('displayName'), t.stringLiteral(this.displayName)),
      t.objectProperty(
        t.stringLiteral('__linaria'),
        t.objectExpression([
          t.objectProperty(t.stringLiteral('className'), t.stringLiteral(this.className)),
          t.objectProperty(
            t.stringLiteral('extends'),
            extendsNode ? t.callExpression(t.identifier(extendsNode), []) : t.nullLiteral(),
          ),
        ]),
      ),
    ]);
    // throw new Error("Method not implemented.");
  }
}

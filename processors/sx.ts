import type { StringLiteral } from '@babel/types';
import type {
  Params,
  ValueCache,
  TailProcessorParams,
  Rules,
  Replacements,
  IOptions,
  // TagSource,
} from '@linaria/tags';
import { BaseProcessor, validateParams } from '@linaria/tags';
import { createTheme } from '@mui/material/styles';
import type { CSSObject } from '@emotion/serialize';
import styleFunctionSx, {
  SxConfig,
  unstable_defaultSxConfig as defaultSxConfig,
} from '@mui/system/styleFunctionSx';
import { cache, css } from '@emotion/css';

export type ICustomOptions<
  T extends {
    unstable_sxConfig?: SxConfig;
  },
> = IOptions & {
  theme?: T;
  darkTheme?: T;
  prefix?: string;
};

export function getTheme<
  T extends {
    unstable_sxConfig?: SxConfig;
  },
>(theme: T | undefined, prefix = ''): T {
  const sxConfig = {
    ...defaultSxConfig,
    ...(theme ?? {}).unstable_sxConfig,
  };

  Object.keys(sxConfig).forEach((configKey) => {
    let value = sxConfig[configKey];
    if (value.themeKey === 'palette' && value.transform) {
      value = {
        ...value,
        transform: (cssValue: unknown, userValue: unknown) => {
          if (cssValue === userValue) {
            return cssValue as string;
          }
          if (
            typeof userValue === 'string' &&
            !userValue.startsWith('rgb') &&
            userValue.includes('.')
          ) {
            return [
              cssValue as string,
              `var(--${prefix ? `${prefix}-` : ''}palette-${(userValue as string)
                .split('.')
                .join('-')}, ${cssValue})`,
            ];
          }
          return cssValue as string;
        },
      };
      sxConfig[configKey] = value;
    }
  });

  if (!theme) {
    const newTheme = createTheme({
      unstable_sxConfig: sxConfig,
    });
    return newTheme as unknown as T;
  }
  theme.unstable_sxConfig = sxConfig;
  return theme;
}

export function generateSxCss<T extends {}>(
  inputObj: CSSObject | ((param: { theme: T; darkTheme: T }) => CSSObject),
  theme: T,
  darkTheme: T,
) {
  const cssObj = styleFunctionSx({
    sx: typeof inputObj === 'function' ? inputObj({ theme, darkTheme }) : inputObj,
    theme,
  });
  if (typeof cssObj === 'string') {
    return cssObj;
  }
  const resultClass = css([cssObj as any]);
  const finalCss = cache.registered[resultClass];
  if (typeof finalCss === 'boolean') {
    return '';
  }

  return finalCss;
}

export default class SxReplacerProcessor<
  T extends {
    unstable_sxConfig?: SxConfig;
  },
> extends BaseProcessor {
  readonly expressionName: string | number | null | boolean = null;

  readonly theme: T | undefined;

  readonly darkTheme: T | undefined;

  readonly prefix?: string;

  constructor([callee, callParam]: Params, ...args: TailProcessorParams) {
    const source = args[0];
    validateParams(
      [callee, callParam],
      ['callee', 'call'],
      `Invalid usage of \`${source.imported}\` tag`,
    );
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
    const presetConfig = args[7] as ICustomOptions<T>;
    this.theme = presetConfig.theme;
    this.darkTheme = presetConfig.darkTheme;
    this.prefix = presetConfig.prefix;

    if (callParam[0] === 'call') {
      const { ex } = callParam[1];
      if (ex.type === 'Identifier') {
        this.expressionName = ex.name;
      } else if (ex.type === 'NullLiteral') {
        this.expressionName = null;
      } else {
        this.expressionName = ex.value;
      }
    }
  }

  public override get asSelector(): string {
    return `.${this.className}`;
  }

  build(values: ValueCache): void {
    const theme = getTheme(this.theme, this.prefix);
    const darkTheme = getTheme(this.darkTheme, this.prefix);
    const cssText = generateSxCss(values.get(this.expressionName) as CSSObject, theme, darkTheme);
    const cssRules: Rules = {
      [this.asSelector]: {
        className: this.className,
        cssText,
        displayName: this.displayName,
        start: this.location?.start,
      },
    };
    // @TODO - Refine later
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

  public override doEvaltimeReplacement(): void {
    this.replacer(this.value, false);
  }

  public override doRuntimeReplacement(): void {
    this.replacer(this.value, false);
  }

  public override get value(): StringLiteral {
    return this.astService.stringLiteral(this.className);
  }
}

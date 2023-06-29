const { alpha } = require("@mui/system/colorManipulator");
const { createTheme } = require("@mui/material");
const withLinaria = require("next-with-linaria");

const defaultTheme = createTheme();

const blue = {
  50: "#F0F7FF",
  100: "#C2E0FF",
  200: "#99CCF3",
  300: "#66B2FF",
  400: "#3399FF",
  main: "#007FFF",
  500: "#007FFF",
  600: "#0072E5", // vs blueDark 900: WCAG 4.6 AAA (large), APCA 36 Not for reading text
  700: "#0059B2",
  800: "#004C99",
  900: "#003A75",
};
const blueDark = {
  50: "#E2EDF8",
  100: "#CEE0F3",
  200: "#91B9E3",
  300: "#5090D3",
  main: "#5090D3",
  400: "#265D97",
  500: "#1E4976",
  600: "#173A5E",
  700: "#132F4C", // contrast 13.64:1
  800: "#001E3C",
  900: "#0A1929",
};
const grey = {
  50: "#F3F6F9",
  100: "#E7EBF0",
  200: "#E0E3E7",
  300: "#CDD2D7", // vs blueDark 900: WCAG 11.6 AAA, APCA 78 Best for text
  400: "#B2BAC2", // vs blueDark 900: WCAG 9 AAA, APCA 63.3 Ok for text
  500: "#A0AAB4", // vs blueDark 900: WCAG 7.5 AAA, APCA 54.3 Only for large text
  600: "#6F7E8C", // vs white bg: WCAG 4.1 AA, APCA 68.7 Ok for text
  700: "#3E5060", // vs white bg: WCAG 8.3 AAA, APCA 88.7 Best for text
  800: "#2D3843", // vs white bg: WCAG 11.9 AAA, APCA 97.3 Best for text
  900: "#1A2027",
};
const error = {
  50: "#FFF0F1",
  100: "#FFDBDE",
  200: "#FFBDC2",
  300: "#FF99A2",
  400: "#FF7A86",
  500: "#FF505F",
  main: "#EB0014", // contrast 4.63:1
  600: "#EB0014",
  700: "#C70011",
  800: "#94000D",
  900: "#570007",
};
const success = {
  50: "#E9FBF0",
  100: "#C6F6D9",
  200: "#9AEFBC",
  300: "#6AE79C",
  400: "#3EE07F",
  500: "#21CC66",
  600: "#1DB45A",
  700: "#1AA251",
  800: "#178D46",
  900: "#0F5C2E",
};
const warning = {
  50: "#FFF9EB",
  100: "#FFF3C1",
  200: "#FFECA1",
  300: "#FFDC48", // vs blueDark900: WCAG 10.4 AAA, APCA 72 Ok for text
  400: "#F4C000", // vs blueDark900: WCAG 6.4 AA normal, APCA 48 Only large text
  500: "#DEA500", // vs blueDark900: WCAG 8 AAA normal, APCA 58 Only large text
  main: "#DEA500",
  600: "#D18E00", // vs blueDark900: WCAG 6.4 AA normal, APCA 48 Only large text
  700: "#AB6800", // vs white bg: WCAG 4.4 AA large, APCA 71 Ok for text
  800: "#8C5800", // vs white bg: WCAG 5.9 AAA large, APCA 80 Best for text
  900: "#5A3600", // vs white bg: WCAG 10.7 AAA, APCA 95 Best for text
};
// context on the Advanced Perceptual Contrast Algorithm (APCA) used above here: https://github.com/w3c/wcag/issues/695

const systemFont = [
  "-apple-system",
  "BlinkMacSystemFont",
  '"Segoe UI"',
  "Roboto",
  '"Helvetica Neue"',
  "Arial",
  "sans-serif",
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  '"Segoe UI Symbol"',
];

const commonSpread = {
  palette: {
    primary: {
      ...blue,
    },
    primaryDark: {
      ...blueDark,
    },
    common: {
      black: "#1D1D1D",
    },
    grey: {
      ...grey,
    },
    error,
    success: {
      ...success,
    },
    warning,
  },
  shape: {
    borderRadius: 10,
  },
  spacing: 10,
  typography: {
    fontFamily: ['"IBM Plex Sans"', ...systemFont].join(","),
    // Match VS Code
    // https://github.com/microsoft/vscode/blob/b38691f611d1ce3ef437c67a1b047c757b7b4e53/src/vs/editor/common/config/editorOptions.ts#L4578-L4580
    // https://github.com/microsoft/vscode/blob/d950552131d7350a45dac8b59bf179469c36c2ac/src/vs/editor/standalone/browser/standalone-tokens.css#L10
    fontFamilyCode: [
      "Menlo", // macOS
      "Consolas", // Windows
      '"Droid Sans Mono"', // Linux
      "monospace", // fallback
    ].join(","),
    fontFamilyTagline: ['"PlusJakartaSans-ExtraBold"', ...systemFont].join(","),
    fontFamilySystem: systemFont.join(","),
    fontWeightSemiBold: 600,
    fontWeightExtraBold: 800,
    h1: {
      fontFamily: ['"PlusJakartaSans-ExtraBold"', ...systemFont].join(","),
      fontSize: "clamp(2.625rem, 1.2857rem + 3.5714vw, 4rem)",
      fontWeight: 800,
      lineHeight: 78 / 70,
    },
    h2: {
      fontFamily: ['"PlusJakartaSans-ExtraBold"', ...systemFont].join(","),
      fontSize: "clamp(1.5rem, 0.9643rem + 1.4286vw, 2.25rem)",
      fontWeight: 800,
      lineHeight: 44 / 36,
    },
    h3: {
      fontFamily: ['"PlusJakartaSans-Bold"', ...systemFont].join(","),
      fontSize: defaultTheme.typography.pxToRem(36),
      lineHeight: 44 / 36,
      letterSpacing: 0.2,
    },
    h4: {
      fontFamily: ['"PlusJakartaSans-Bold"', ...systemFont].join(","),
      fontSize: defaultTheme.typography.pxToRem(28),
      lineHeight: 42 / 28,
      letterSpacing: 0.2,
    },
    h5: {
      fontFamily: ['"PlusJakartaSans-Bold"', ...systemFont].join(","),
      fontSize: defaultTheme.typography.pxToRem(24),
      lineHeight: 36 / 24,
      letterSpacing: 0.1,
    },
    h6: {
      fontSize: defaultTheme.typography.pxToRem(20),
      lineHeight: 30 / 20,
    },
    button: {
      textTransform: "initial",
      fontWeight: 700,
      letterSpacing: 0,
    },
    subtitle1: {
      fontSize: defaultTheme.typography.pxToRem(18),
      lineHeight: 24 / 18,
      letterSpacing: 0,
      fontWeight: 500,
    },
    body1: {
      fontSize: defaultTheme.typography.pxToRem(16), // 16px
      lineHeight: 24 / 16,
      letterSpacing: 0,
    },
    body2: {
      fontSize: defaultTheme.typography.pxToRem(14), // 14px
      lineHeight: 21 / 14,
      letterSpacing: 0,
    },
    caption: {
      display: "inline-block",
      fontSize: defaultTheme.typography.pxToRem(12), // 12px
      lineHeight: 18 / 12,
      letterSpacing: 0,
      fontWeight: 700,
    },
    allVariants: {
      scrollMarginTop: "calc(var(--MuiDocs-header-height) + 32px)",
    },
  },
};

const theme = createTheme({
  ...commonSpread,
  palette: {
    ...commonSpread.palette,
    divider: grey[100],
    mode: "light",
    text: {
      primary: grey[900],
      secondary: grey[700],
    },
    grey: {
      ...commonSpread.palette.grey,
      main: grey[100],
      contrastText: grey[600],
    },
    success: {
      ...success,
      main: "#1AA251", // contrast 3.31:1
    },
  },
  typography: {
    ...commonSpread.typography,
    h1: {
      ...commonSpread.typography.h1,
      color: blueDark[900],
    },
    h2: {
      ...commonSpread.typography.h2,
      color: blueDark[700],
    },
    h5: {
      ...commonSpread.typography.h5,
      color: blue.main,
    },
  },
});

const darkTheme = createTheme({
  ...commonSpread,
  palette: {
    ...commonSpread.palette,
    primary: {
      ...commonSpread.palette.primary,
      ...blueDark,
      main: blue[400],
    },
    divider: alpha(blue[100], 0.08),
    mode: "dark",
    background: {
      default: blueDark[800],
      paper: blueDark[900],
    },
    text: {
      primary: "#fff",
      secondary: grey[400],
    },
    grey: {
      ...commonSpread.palette.grey,
      main: grey[700],
      contrastText: grey[600],
    },
    success: {
      ...success,
      main: "#1DB45A", // contrast 6.17:1 (blueDark.800)
    },
  },
  typography: {
    h2: {
      ...commonSpread.typography.h2,
      color: grey[100],
    },
    h5: {
      ...commonSpread.typography.h5,
      color: blue[300],
    },
  },
});

const varKeys = [
  "direction",
  "palette",
  "spacing",
  "typography",
  "zIndex",
  "shape",
];

function iterateObj(obj, keys, cssObj, varsObj, isTopLevel = true) {
  Object.keys(obj).forEach((key) => {
    if (isTopLevel && !varKeys.includes(key)) {
      return;
    }
    const value = obj[key];
    if (typeof value === "function") {
      return;
    }
    if (typeof value === "object") {
      const newVars = varsObj[key] ?? {};
      varsObj[key] = newVars;
      iterateObj(value, keys.concat(key), cssObj, newVars, false);
    } else {
      const hyphenatedKeys = [...keys, key].join("-");
      const cssVarKey = `--${hyphenatedKeys}`;
      cssObj[cssVarKey] = value;
      varsObj[key] = `var(${cssVarKey})`; //, ${value})`;
    }
  });
}

function getVarsFromTheme(theme) {
  const cssVars = {};
  const varsToCssVarsMapping = {};
  iterateObj(theme, ["mui"], cssVars, varsToCssVarsMapping);
  return { vars: cssVars, mapping: varsToCssVarsMapping };
}

const { vars: lightVars, mapping: lightMapping } = getVarsFromTheme(theme);
theme.vars = lightMapping;
theme.varsCssObject = lightVars;
theme.applyDarkStyles = (obj) => ({
  ".darkThemeClass &": obj,
});

const { vars: darkVars, mapping: darkMapping } = getVarsFromTheme(darkTheme);
darkTheme.vars = darkMapping;
darkTheme.varsCssObject = darkVars;

/** @type {import('next-with-linaria').LinariaConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
  linaria: {
    prefix: "mui",
    theme,
    darkTheme,
    displayName: true,
    tagResolver(_importPath, importName) {
      switch (importName) {
        case "styled":
          return "@mui/linaria-processor/styled";
        case "sx":
          return "@mui/linaria-processor/sx";
        default:
          return null;
      }
    },
    classNameSlug(slug, displayName) {
      if (displayName.endsWith("ThemeClass")) {
        return displayName;
      }
      return slug;
    },
  },
};

module.exports = withLinaria(nextConfig);

import { sx } from "@/components/styled";

export const darkThemeClass = sx(
  ({ darkTheme }: any) => darkTheme.varsCssObject
);

export const lightThemeClass = sx(({ theme }: any) => theme.varsCssObject);

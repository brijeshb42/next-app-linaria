import { alpha } from "@mui/system/colorManipulator";
import { styled } from "../styled";

export const Header = styled.header(({ theme }: any) => ({
  width: "100%",
  position: "sticky",
  top: 0,
  transition: theme.transitions.create("top"),
  zIndex: theme.zIndex.appBar,
  backdropFilter: "blur(8px)",
  boxShadow: `inset 0px -1px 1px ${theme.vars.palette.grey[100]}`,
  backgroundColor: "rgba(255,255,255,0.8)",
  ...theme.applyDarkStyles({
    boxShadow: `inset 0px -1px 1px ${theme.vars.palette.primaryDark[700]}`,
    backgroundColor: alpha(theme.palette.primaryDark[900], 0.7),
  }),
}));

export const Container = styled.div(({ theme }: any) => ({
  width: "100%",
  marginLeft: "auto",
  boxSizing: "border-box",
  marginRight: "auto",
  display: "flex",
  justifyContent: "space-between",
  px: 2,
  alignItems: "center",
  minHeight: "56px",
  [theme.breakpoints.up("sm")]: {
    px: 3,
  },
  [theme.breakpoints.up("lg")]: {
    maxWidth: 1200,
  },
}));

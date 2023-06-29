// interface Styled<P> {
//   (tag: keyof React.ElementType) => void;
// }

function styled(tag, options = {}) {
  if (process.env.NODE_ENV !== "production") {
    if (tag === undefined) {
      throw new Error(
        "You are trying to create a styled element with an undefined component.\nYou may have forgotten to import it."
      );
    }
  }

  const identifierName = options.label;

  function styledInterpolator({ class: staticClass }) {
    function StyledComponent({ as, sx, className, ...restProps }) {
      // console.log(restProps, { as, sx, className });
      const Component = as ?? tag;
      let finalClass = "";
      if (staticClass) {
        finalClass += staticClass;
      }
      if (className) {
        finalClass += finalClass ? ` ${className}` : className;
      }
      if (typeof sx === "string") {
        finalClass += finalClass ? ` ${sx}` : sx;
      }

      return (
        <Component
          className={finalClass ? finalClass : undefined}
          {...restProps}
        />
      );
    }

    StyledComponent.displayName =
      identifierName ??
      `Styled(${
        typeof tag === "string"
          ? tag
          : tag.displayName || tag.name || identifierName || "Component"
      })`;
    StyledComponent.defaultProps = tag.defaultProps;

    return StyledComponent;
  }

  return styledInterpolator;
}

const proxiedStyled = new Proxy(styled, {
  get(target, propName) {
    // console.log({ propName });
    return target(propName);
  },
});

export { proxiedStyled as styled };

export function sx(obj) {
  return obj;
}

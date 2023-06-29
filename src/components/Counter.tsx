"use client";

import { useState } from "react";
import { styled } from "@linaria/react";

const CountButton = styled("button")`
  color: ${(props: any) => (props.isRed ? "red" : "blue")};
  border-radius: 9px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;

  &:hover {
    border-color: #646cff;
  }
  &:focus,
  &:focus-visible {
    outline: 4px auto -webkit-focus-ring-color;
  }
`;

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <CountButton
      // @ts-ignore
      isRed={count % 2 === 0}
      onClick={() => setCount((count) => count + 1)}
    >
      count is {count}
    </CountButton>
  );
}

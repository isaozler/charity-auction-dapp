import { FC } from "react";
import { styled } from "@/styles/config";

const Comp = styled("main", {
  margin: "0 $4",
  "@s": {
    margin: "0 $8",
  },
  "@minM": {
    margin: 0,
  },
});

export const Main: FC<React.HTMLProps<HTMLDivElement>> = ({ children }) => {
  return <Comp>{children}</Comp>;
};

import { styled } from "@/styles/config";

export const Wrapper = styled("div", {
  maxWidth: "100%",
  width: "100%",
  margin: "0 auto",
  "@minM": {
    maxWidth: 600,
  },
  "@minHLarge": {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
});

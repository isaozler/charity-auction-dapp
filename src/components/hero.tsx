import { styled } from "@/styles/config";

export const Hero = () => {
  return (
    <Wrapper>
      <SubTitle>February 6, 2023</SubTitle>
      <Title>Türkiye Earthquake</Title>
      <Sub>
        1.000.000 KDA Donated <span>~ 1.000.000 USD</span>
      </Sub>
    </Wrapper>
  );
};

const Wrapper = styled("div", {
  marginTop: "$10",
});
const SubTitle = styled("h2", {
  fontSize: "$m",
  fontWeight: 400,
});
const Title = styled("h1", {
  fontFamily: "$kadena",
  fontSize: "$2xl",
  margin: "$2 0 0",
});
const Sub = styled("span", {
  fontFamily: "$kadena",
  fontSize: "$xs",
  span: {
    opacity: 0.5,
  },
});

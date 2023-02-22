import { FC, useState } from "react";
import { styled } from "@/styles/config";
import { ChevronDown } from "@/components/icons";

interface ISelectProps extends React.HTMLAttributes<HTMLSelectElement> {
  hasSpaceAround?: boolean;
  disabled?: boolean;
}

export const Select: FC<ISelectProps> = ({
  children,
  onChange,
  hasSpaceAround,
  ...props
}) => {
  const [isFocussed, setIsFocussed] = useState(false);

  return (
    <Wrapper>
      <SelectComponent
        hasSpaceAround={hasSpaceAround}
        disabled={props.disabled}
        onFocus={() => setIsFocussed(true)}
        onBlur={() => setIsFocussed(false)}
        onChange={onChange}
      >
        {children}
      </SelectComponent>
      <IconWrapper
        hasSpaceAround={hasSpaceAround}
        isFocus={isFocussed}
        isDisabled={props.disabled}
      >
        <Icon />
      </IconWrapper>
    </Wrapper>
  );
};

const Wrapper = styled("div", {
  position: "relative",
  // margin: "$8 0 $4",
});

const IconWrapper = styled("div", {
  position: "absolute",
  top: 0,
  right: 0,
  width: 40,
  height: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  variants: {
    isFocus: {
      true: {
        transform: "rotate(180deg)",
      },
    },
    isDisabled: {
      true: {
        opacity: 0.4,
      },
    },
    hasSpaceAround: {
      true: {
        marginTop: "$4",
        marginBottom: "$4",
      },
    },
  },
});

const Icon = styled(ChevronDown, {});

const SelectComponent = styled("select", {
  borderWidth: 2,
  borderColor: "$white",
  borderRadius: 0,
  borderStyle: "solid",
  width: "100%",
  padding: 0,
  paddingLeft: "$4",
  paddingRight: "$2",
  height: 40,
  fontFamily: "$kadena",
  fontSize: "$base",
  color: "$white",
  background: "transparent",
  appearance: "none",
  "&:disabled": {
    opacity: 0.4,
  },
  variants: {
    hasSpaceAround: {
      true: {
        marginTop: "$4",
        marginBottom: "$4",
      },
    },
  },
});

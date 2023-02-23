import { styled } from "@/styles/config";
import { ChangeEventHandler, MouseEvent, FC, MouseEventHandler } from "react";
export { Select } from "./select";

export const Address: FC<{
  label: string;
  address: string;
  type?: "sender";
}> = ({ label, address, type }) => {
  return (
    <Component type={type}>
      <span>{label}</span>
      <div>{address}</div>
    </Component>
  );
};

const Component = styled("div", {
  fontFamily: "$kadena",
  fontSize: "$xs",
  span: {
    opacity: 0.5,
  },
  overflow: "hidden",
  div: {
    width: "100%",
    maxWidth: "100%",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
    paddingRight: "$4",
  },
  variants: {
    type: {
      sender: {
        gridArea: "address",
      },
    },
  },
});

export const Input: FC<{
  disabled: boolean;
  label: string;
  initialValue: number;
  onChange: ChangeEventHandler<HTMLInputElement>;
}> = ({ disabled, label, initialValue, onChange }) => {
  return (
    <InputWrapper>
      <InputContainer>
        <InputDOM
          type="number"
          min={1}
          max={100}
          defaultValue={!disabled ? initialValue : 0}
          disabled={disabled}
          onChange={onChange}
        />
        <Label isDisabled={disabled}>{label}</Label>
      </InputContainer>
      {!disabled && <PriceIndicator>+/- 10 USD</PriceIndicator>}
    </InputWrapper>
  );
};

const InputWrapper = styled("div", {
  display: "grid",
  // flexDirection: "column",
  gridArea: "amount",
  gridColumnStart: 1,
  gridColumnEnd: 2,
});
const InputContainer = styled("div", {
  position: "relative",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
});
const InputDOM = styled("input", {
  borderWidth: 2,
  borderColor: "$white",
  borderRadius: 0,
  borderStyle: "solid",
  padding: 0,
  paddingLeft: "$2",
  paddingRight: "$2",
  height: 40,
  width: 80,
  background: "transparent",
  textAlign: "center",
  outline: "none",
  fontFamily: "$kadena",
  fontSize: "$l",
  color: "$white",
  "&:disabled": {
    opacity: 0.4,
  },
});
const Label = styled("div", {
  fontFamily: "$kadena",
  fontSize: "$l",
  color: "$white",
  paddingLeft: "$3",
  variants: {
    isDisabled: {
      true: {
        color: "rgba(255,255,255,0.4)",
      },
    },
  },
});
const PriceIndicator = styled("div", {
  marginTop: "$2",
  fontFamily: "$kadena",
  fontSize: "$xs",
  color: "$white",
  opacity: 0.5,
});

export const Submit: FC<{
  name?: "submit";
  disabled: boolean;
  label: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
}> = ({ name, label, disabled, onClick }) => {
  return (
    <Wrapper name={name}>
      <Button disabled={disabled} onClick={onClick}>
        {label}
      </Button>
    </Wrapper>
  );
};

const Wrapper = styled("div", {
  display: "inline-grid",
  gridArea: "attr(data-name)",
  variants: {
    name: {
      submit: {
        gridArea: "submit",
      },
    },
  },
});

export const submitButtonStyle = {
  background: "$white",
  height: 40,
  borderWidth: 2,
  borderStyle: "solid",
  borderColor: "$white",
  padding: "0 $4",
  fontFamily: "$kadena",
  "&:active": {
    background: "transparent",
    color: "$white",
  },
  "&:disabled": {
    opacity: 0.4,
    background: "transparent",
    color: "$white",
  },
  cursor: "pointer",
  variants: {
    outlined: {
      true: {
        background: "transparent",
        color: "$white",
        "&:active": {
          background: "$white",
          color: "$black",
        },
      },
    },
  },
};

export const Button = styled("button", submitButtonStyle);

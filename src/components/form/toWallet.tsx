import { styled } from "@/styles/config";
import { Address } from "@/components/form/components";
import { Copy, VerifiedAddress } from "@/components/icons";
import { FC } from "react";
import { TOrganization } from "@/context/constants";

const WalletBox = styled("div", {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

const Icons = styled("div", {
  display: "flex",
  flexDirection: "row",
  gap: "$2",
});
const Verified = styled(VerifiedAddress, {
  width: 24,
  height: 24,
});
const CopyAddress = styled(Copy, {
  width: 24,
  height: 24,
});

export const ToWallet: FC<{ target: TOrganization }> = ({ target }) => {
  return (
    <WalletBox>
      <Address label="Wallet address:" address={target.id} />
      <Icons>
        <Verified />
        <CopyAddress />
      </Icons>
    </WalletBox>
  );
};

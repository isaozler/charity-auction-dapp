import { styled } from "@/styles/config";
import IOLogo from "@/components/icons/logo-io";
import KLogo from "@/components/icons/logo-k";
import { useForm } from "../hooks/wallets/useForm";
import { useEffect } from "react";

const Component = () => {
  const { currentBalance } = useForm({ setShowModal: () => {} });

  return (
    <Box>
      <a
        href="https://isaozler.com"
        target="_blank"
        rel="noopener noreferrer"
        title="Initiated by IO @isaozler to support the Turkish people who suffered from the earthquake on the 6th of February 2023"
      >
        <IOLogo />
      </a>
      <KLogo state={currentBalance ? "connected" : "init"} />
    </Box>
  );
};

const Box = styled("div", {
  display: "flex",
  width: "100%",
  justifyContent: "space-between",
  paddingTop: "$10",
});

export const Header = styled(Component, {});

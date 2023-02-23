import { styled } from "@/styles/config";
import {
  Address,
  Select,
  Input,
  Submit,
  Button,
  submitButtonStyle,
} from "@/components/form/components";
import { useEffect, useState } from "react";
import { ToWallet } from "./toWallet";
import Modal from "@/components/modal";
import { TTransferParams, useForm } from "@/hooks/wallets/useForm";
export type TWalletType = "XWallet" | "WalletConnect";

export const Form = () => {
  const [showModal, setShowModal] = useState(false);
  const {
    isConnected,
    activeClient,
    session,
    connectHandler,
    connectWalletHandler,
    disconnectHandler,
    organizations,
    selectedChain,
    setSelectedOrganization,
    selectedOrganization,
    setSelectedChain,
    initialAmount,
    setAmount,
    amount,
    availableClients,
    transferCoins,
    transactionStatus,
    currentBalance,
    balances,
  } = useForm({ setShowModal });

  useEffect(() => {
    console.log("balances", balances);
  }, [balances]);

  return (
    <Wrapper>
      <FormDOM onSubmit={(e) => e.preventDefault()}>
        <AddressWrapper>
          <Address
            type="sender"
            label={
              isConnected && activeClient
                ? `${activeClient} (${currentBalance?.balance || 0} KDA)`
                : "Unconnected"
            }
            address={
              isConnected && session
                ? session.account
                : "Sign in to your wallet to activate"
            }
          />
          <ButtonsWrapper>
            {!isConnected && (
              <Button outlined onClick={connectHandler}>
                Connect
              </Button>
            )}
            {isConnected && (
              <Button outlined onClick={disconnectHandler}>
                Disconnect
              </Button>
            )}
          </ButtonsWrapper>
        </AddressWrapper>
        <Select
          hasSpaceAround={true}
          disabled={!isConnected}
          onChange={(e) => {
            const selected = organizations.find(
              ({ id }) => id === e.currentTarget.value
            );

            if (selected) {
              setSelectedOrganization(selected);
            } else {
              setSelectedOrganization(null);
            }
          }}
        >
          <option>Select Organization</option>
          {organizations?.map(({ id, name }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </Select>
        {isConnected && selectedOrganization && (
          <ToWallet target={selectedOrganization} />
        )}
        <Footer>
          <Input
            label="KDA"
            initialValue={initialAmount}
            disabled={!isConnected || !selectedOrganization}
            onChange={(e) => {
              const newAmount = parseInt(e.currentTarget.value, 10);

              if (newAmount && !isNaN(newAmount)) {
                setAmount(newAmount);
              } else {
                setAmount(0);
              }
            }}
          />
          <Select
            name="chain"
            disabled={!amount || !balances.length || !selectedOrganization}
            onChange={(e) => {
              const selected = Array.from({ length: 20 })
                .map((_, index) => index)
                .find((_, index) => index === parseInt(e.currentTarget.value));

              if (typeof selected === "number") {
                setSelectedChain(`${selected}` as TTransferParams["chainId"]);
              } else {
                setSelectedChain(null);
              }
            }}
          >
            <option>Select Chain</option>
            {balances
              .map((balance, index) => {
                return {
                  balance,
                  label: `${balance.toFixed(2)} KDA (Chain ${index})`,
                };
              })
              ?.filter(({ balance }) => balance)
              .map(({ balance, label }, index) => (
                <option key={`chain-${index}-${balance}`} value={index}>
                  {label}
                </option>
              ))}
          </Select>
          <Submit
            name="submit"
            label="Donate"
            disabled={
              !isConnected ||
              !selectedOrganization ||
              !amount ||
              !currentBalance ||
              amount > currentBalance?.balance
            }
            onClick={(e) => {
              e.preventDefault();
              if (selectedOrganization?.id && amount && selectedChain) {
                transferCoins(amount, selectedOrganization.id, selectedChain);
              }
            }}
          />
        </Footer>
        {transactionStatus && (
          <div>
            <span>{transactionStatus.message}</span>
            <br />
            <span>{transactionStatus.type}</span>
          </div>
        )}
      </FormDOM>
      <Modal
        onClose={() => setShowModal(false)}
        show={showModal}
        title="Choose your Wallet"
      >
        {(availableClients.length && (
          <ConnectionButtons>
            {availableClients.map((client) => (
              <ConnectorButton
                key={client.trim().toLowerCase()}
                onClick={() => connectWalletHandler(client)}
              >
                {client}
              </ConnectorButton>
            ))}
          </ConnectionButtons>
        )) ||
          "Connectors not available at the moment"}
      </Modal>
    </Wrapper>
  );
};

const Wrapper = styled("div", {
  marginTop: "$10",
});

const AddressWrapper = styled("div", {
  display: "grid",
  gridTemplateAreas: `
      "address"
      "button"
    `,
  gridGap: "$4",
  "@minM": {
    gridTemplateAreas: `
      "address button"
    `,
  },
});

const FormDOM = styled("form", {
  margin: 0,
});

const ConnectionButtons = styled("div", {
  flexDirection: "column",
  gap: "$4",
  margin: "$2 0",
  alignItems: "center",
  justifyContent: "center",
});

const ButtonsWrapper = styled("div", {
  display: "inline-grid",
  gridArea: "button",
});

const ConnectorButton = styled("button", submitButtonStyle);

const Footer = styled("div", {
  display: "grid",
  marginTop: "$8",
  gridTemplateAreas: `
    "amount amount chain"
    ". . submit"
  `,
  gridGap: "$4",
  "@minM": {
    gridTemplateAreas: `
      "amount chain submit"
    `,
    gridColumnGap: "$4",
  },
  "@xs": {
    gridTemplateAreas: `
      "amount"
      "chain"
      "submit"
    `,
    gridColumnGap: "$4",
  },
});

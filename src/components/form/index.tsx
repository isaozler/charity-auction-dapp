import { styled } from "@/styles/config";
import {
  Address,
  Select,
  Input,
  Submit,
  Button,
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
        title="Select Connector"
      >
        {(availableClients.length && (
          <>
            {availableClients.map((client) => (
              <ConnectorButton
                key={client.trim().toLowerCase()}
                onClick={() => connectWalletHandler(client)}
              >
                {client}
              </ConnectorButton>
            ))}
          </>
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
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
});

const FormDOM = styled("form", {
  margin: 0,
});

const ConnectorButton = styled("button", {});

const Footer = styled("div", {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "$8",
});

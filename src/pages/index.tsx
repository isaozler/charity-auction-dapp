import Head from "next/head";
import { Main, Wrapper, Header, Hero, Form } from "@/components";
import { styled } from "@/styles/config";

export default function Home() {
  return (
    <>
      <Head>
        <title>Donate KDA</title>
        <meta name="description" content="Generated by IO" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Main>
        <Wrapper>
          <Header />
          <Hero />
          <Form />
        </Wrapper>
        <Modal id="modal-root" />
      </Main>
    </>
  );
}

const Modal = styled("div", {});
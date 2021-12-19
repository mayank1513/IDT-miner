import type { AppProps } from "next/app";
import { createGlobalStyle } from "styled-components";
import Head from "next/head";

import Header from "@/components/Header";

const GlobalStyles = createGlobalStyle`
html,
body {
    padding: 0;
    margin: 0;
}
body {
  overflow-x: hidden;
}
a {
    color: inherit;
    text-decoration: none;
}

* {
    box-sizing: border-box;
    transition: all .5s;
}
`;

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>IDT Miner</title>
        <link rel="icon" href="/logo.png" />
      </Head>
      <GlobalStyles />
      <Header></Header>
      <main>
        <Component {...pageProps} />
      </main>
    </>
  );
}

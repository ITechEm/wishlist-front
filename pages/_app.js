import "@/styles/globals.css";
import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  /* Import Inknut Antiqua font from Google Fonts */
  @import url('https://fonts.googleapis.com/css2?family=Inknut+Antiqua:wght@400&display=swap');
  
  body {
    background-color: #fff;
    margin: 0;
    padding: 0;
    font-weight: 500;
    font-family: 'Inknut Antiqua', serif;  /* Use Inknut Antiqua */
  }

  hr {
    display: block;
    border: 0;
    border-top: 1px solid #ccc;
  }
`;

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

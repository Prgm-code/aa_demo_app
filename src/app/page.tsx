"use client";


import dotenv from "dotenv";

import { ThemeProvider } from "@mui/material/styles";
import { SafeThemeProvider } from "@safe-global/safe-react-components";
import AppBar from "./components/AppBar";
import Accounts from "./components/Accounts";
import WalletCreate from "@/scenes/Wallet/WalletCreate";
dotenv.config();


function App() {



  return (
    <SafeThemeProvider mode="light">
      {(safeTheme) => (
        <ThemeProvider theme={safeTheme}>
          
            <AppBar />
            <Accounts />
           {/*  <WalletCreate /> */}
          
        </ThemeProvider>
      )}
    </SafeThemeProvider>
  );
}

export default App;

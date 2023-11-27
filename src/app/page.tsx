"use client";
import React, { useState ,useEffect } from "react";
import {
  Modal,
  Box,
  Backdrop,
  Fade,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { SafeThemeProvider } from "@safe-global/safe-react-components";
import AppBar from "./components/AppBar";
import Accounts from "./components/Accounts";
import { CssBaseline } from "@mui/material";
import useAccountAbstractionStore from "@/stores/accountAbstraccionStore";
import dotenv from "dotenv";
import ChainSelectModal from "./components/ChainSelectModal";
dotenv.config();

function App() {
  const  { cleanUp } = useAccountAbstractionStore();

  useEffect(() => {
    return () => {
      cleanUp();
    };
  }, [ cleanUp]);

  return (
    <SafeThemeProvider mode="light">
      {(safeTheme) => (
        <ThemeProvider theme={safeTheme}>
          <CssBaseline />
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <ChainSelectModal />
            <AppBar />
            <Accounts />
          </div>
        </ThemeProvider>
      )}
    </SafeThemeProvider>
  );
}

export default App;



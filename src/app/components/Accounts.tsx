"use client";
import { use, useCallback, useEffect, useState } from "react";
import {
  Box,
  Divider,
  Grid,
  Typography,
  Paper,
  Button,
  LinearProgress,
} from "@mui/material";
import { EthHashInfo } from "@safe-global/safe-react-components";
import useAccountAbstractionStore from "../../stores/accountAbstraccionStore";
import { utils } from "ethers";
import AmountLabel from "./AmountLabel";
import usePolling from "@/hooks/usePolling";
import RelayTransaction from "./RelayTransaction";
import GelatoTaskStatusLabel from "./GelatoTaskStatusLabel";

function Accounts() {
  const {
    web3Provider,
    isAuthenticated,
    safeSelected,
    getSafeAddress,
    isDeployed,
    isRelayerLoading,
    gelatoTaskId,
    chainId,
    chain,
    login,
    logout,
    modalPackError,
    setBalance,

  } = useAccountAbstractionStore();
  useEffect(() => {
    if (isAuthenticated) {
      getSafeAddress();
    }
  }, [isAuthenticated, getSafeAddress]);
  const [transactionHash, setTransactionHash] = useState<string>("");
  useEffect(() => {
    if (modalPackError) {
        console.log("modalPackError", modalPackError);
        logout();    
    }
    }
    , [modalPackError, logout]);    


  // fetch safe address balance with polling
  const fetchSafeBalance = useCallback(async () => {
    const balance = await web3Provider?.getBalance(safeSelected);

    return balance?.toString();
  }, [web3Provider, safeSelected]);

  const safeBalance = usePolling(fetchSafeBalance);
  useEffect(() => {
      setBalance(safeBalance);
  }
, [safeBalance, setBalance]);



  return (
    <div>
      <Grid
        container
        spacing={2}
        justifyContent="center"
        alignItems="stretch"
        mt={3}
        mb={3}
      >
        {!isAuthenticated ? (
          <Grid item xs={12}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "150px", // Altura mínima de la caja
                borderRadius: "16px",
                bgcolor: "background.paper",
                width: "100%",
                boxShadow: "none",
                backdropFilter: "blur(10px)",
              }}
            >
              <Typography variant="h6" textAlign="center" sx={{ mb: 2 }}>
                Welcome to Account Abstraction
              </Typography>
              <Typography textAlign="center" sx={{ mb: 4 }}>
                Click below to connect your wallet and continue.
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                onClick={login}
              >
                Connect Wallet
              </Button>
            </Paper>
          </Grid>
        ) : (
          <>
            <Grid item xs={10} sm={6} md={5}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "150px",
                  borderRadius: "16px",
                  bgcolor: "background.paper",
                  width: "100%",
                  maxWidth: "400px",
                  overflow: "auto", // Makes the content scrollable if it overflows
                }}
              >
                <Typography variant="h5" color="black" gutterBottom>
                  Smart Contract Account
                </Typography>
                <Divider
                  sx={{
                    width: "100%",
                    my: 1,
                    bgcolor: "gray",
                    height: "1px",
                  }}
                />
                {safeSelected ? (
                  <Box
                    display="flex"
                    alignItems="center"
                    flexDirection="column"
                  >
                    <Box display="flex" alignItems="center" flexDirection="row">
                      <EthHashInfo
                        address={safeSelected}
                        showCopyButton
                        showPrefix
                        prefix={getPrefix(chainId || "0x5")}
                        hasExplorer={true}
                        ExplorerButtonProps={{
                          title: "View on Etherscan",
                          href: `${chain?.blockExplorerUrl}/address/${safeSelected}`,
                        }}
                      />
                      <Typography variant="caption" sx={{ mt: 1 }}>
                        {isDeployed
                          ? "Active"
                          : "Inactive. Transaction required to activate."}
                      </Typography>
                    </Box>

                    <Typography
                      fontWeight="700"
                      sx={{
                        fontSize: "0.75rem", // Reduce el tamaño de la fuente
                        color: "black", // Cambia el color del texto
                        mt: 0.5, // Margen superior para separar de la línea del nombre
                      }}
                    >
                      <AmountLabel
                        amount={utils.formatEther(safeBalance || "0")}
                        tokenSymbol={chain?.token || "gETH"}
                      />
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    my={2}
                  >
                    <Typography>Skeleton</Typography>{" "}
                    {/* cambiar por un skeleton ... */}
                  </Box>
                )}
              </Paper>
            </Grid>
            <Grid item xs={10} sm={6} md={5}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "150px",
                  borderRadius: "16px",
                  bgcolor: "background.paper",
                  width: "100%",
                  maxWidth: "400px",
                  overflow: "auto", // Makes the content scrollable if it overflows
                }}
              >
                {!safeSelected ? (
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    my={2}
                  >
                    <Typography>No Available Safes</Typography>{" "}
                    {/* cambiar por un skeleton ... */}
                  </Box>
                ) : (
                  <>
                    {gelatoTaskId && (
                      <>
                        <GelatoTaskStatusLabel
                          gelatoTaskId={gelatoTaskId}
                          chainId={chainId}
                          setTransactionHash={setTransactionHash}
                          transactionHash={transactionHash}
                        />
     
                      </>
                    )}

                    {isRelayerLoading && (
                      <LinearProgress sx={{ alignSelf: "stretch" }} />
                    )}

                    {!isRelayerLoading && !gelatoTaskId && <RelayTransaction />}
                  </>
                )}
              </Paper>
            </Grid>
          </>
        )}
      </Grid>
    </div>
  );
}

export default Accounts;

const getPrefix = (chainId: string) => {
  switch (chainId) {
    case "0x1":
      return "Eth";
    case "0x5":
      return "gEth";
    case "0x100":
      return "gno";
    case "0x64":
      return "xdai";
    case "0x89":
      return "matic";
    case "0x13881":
      return "matic";
    default:
      return "eth";
  }
};

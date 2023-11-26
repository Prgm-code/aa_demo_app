"use client";
import { useCallback, useEffect, useState } from "react";
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
  } = useAccountAbstractionStore();
  useEffect(() => {
    if (isAuthenticated) {
      getSafeAddress();
    }
  }, [isAuthenticated, getSafeAddress]);
  const [transactionHash, setTransactionHash] = useState<string>("");

  const handleCreateAccountAbstractionContract = () => {
    // getSafeAddress(); delete this logic
  };

  // fetch safe address balance with polling
  const fetchSafeBalance = useCallback(async () => {
    const balance = await web3Provider?.getBalance(safeSelected);

    return balance?.toString();
  }, [web3Provider, safeSelected]);

  const safeBalance = usePolling(fetchSafeBalance);

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
              <Typography variant="h6" textAlign="center">
                Login to see your addresses
              </Typography>
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
                        prefix={getPrefix("0x5")}
                        hasExplorer={true}
                        ExplorerButtonProps={{
                          title: "View on Etherscan",
                          href: `https://goerli.etherscan.io/address/${safeSelected}`,
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
                        tokenSymbol={/* chain?.token || */ "gETH"}
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
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleCreateAccountAbstractionContract}
                      sx={{ mt: 2 }}
                    >
                      Create AAC
                    </Button>
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
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleCreateAccountAbstractionContract}
                      sx={{ mt: 2 }}
                    >
                      Create AAC
                    </Button>
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
                        {/* <Button
                          onClick={() => {}}
                          size="small" // Change the size to 'large', 'medium', or 'small'
                          color="inherit" // This will use the primary color from your theme
                          sx={{
                            backgroundColor: "#4caf50", // Use a hex color or a color name like 'green'
                            "&:hover": {
                              backgroundColor: "#388e3c", // Darken color on hover
                            },
                            width: "auto", // Set the width as needed, or use 'auto' to size based on content
                            padding: "8px 16px", // Adjust padding to make the button larger
                            fontSize: "1rem",
                          }}
                        >
                          New Transaction
                        </Button> */}
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
      return "eth";
    case "0x5":
      return "gor";
    case "0x100":
      return "gno";
    case "0x137":
      return "matic";
    default:
      return "eth";
  }
};

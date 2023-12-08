"use client";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

import useAccountAbstractionStore from "@/stores/accountAbstraccionStore";
import { ethers, Contract } from "ethers";
import nftContractAbi from "@/artifacts/contracts/class10/MiPrimerNFT.sol/MiPrimerNft.json";
import { useEffect, useState } from "react";
import GelatoTaskStatusLabel from "./GelatoTaskStatusLabel";
const nftContractAddress = "0x9D78a3fc76B9B88cd392cF00f8C56082cD7d203D";

function ContractActions() {
  const {
    chainId,
    relaySendTransaction,
    relayError,
    balance,
    signer,
    isRelayerLoading,
    gelatoTaskId,
    safeSelected,
  } = useAccountAbstractionStore();

  const nftContract = new Contract(
    nftContractAddress,
    nftContractAbi.abi,
    signer
  );

  const [transactionHash, setTransactionHash] = useState<string>("");
  const [prefix, setPrefix] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (chainId) {
      setPrefix(getPrefix(chainId));
    }
  }, [chainId]);
  useEffect(() => {
    if (relayError) {
      setError(
        relayError instanceof Error
          ? relayError.message
          : "An unknown error occurred"
      );
    }
  }, [relayError]);
  const checkBalance = () => {
    console.log("balance", balance);
    if (Number(balance) === 0) {
      console.log("You don't have enough funds to send this amount");
      throw new Error("You don't have enough funds to send this amount");
    }
  };
  const handleMintNft = async () => {
    const abi = [
        "function safeMintTo(address to) public",

        ];
    const nftContract = new Contract(
      nftContractAddress,
      abi,
      signer
    );
    console.log("nftContract", nftContract);
    console.log("signer", signer);
    console.log("safeSelected", safeSelected);
    const mintData = nftContract.interface.encodeFunctionData("safeMintTo", [safeSelected]);

    setIsSending(true);
    setError(""); // Reset any previous errors
    const amount = "0";
    try {
      checkBalance();
      const data = mintData;
      await relaySendTransaction(nftContractAddress, amount, data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    }
    setIsSending(false);
  };

  return (
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
        {!isRelayerLoading && !gelatoTaskId && (
          <Box
            display="flex"
            flexDirection="column"
            gap={2}
            alignItems="center"
            justifyContent="center"
            width={300}
            mx="auto"
          >
            <Typography fontWeight="700">Mint NFT on chain {prefix}</Typography>
            <Divider sx={{ width: "100%", bgcolor: "gray", height: "1px" }} />

            <Button
              startIcon={
                isSending ? <CircularProgress size={14} /> : <SendIcon />
              }
              variant="outlined"
              onClick={handleMintNft}
              disabled={isSending}
            >
              {isSending ? "Sending..." : "Send"}
            </Button>

            {error && (
              <Alert
                severity="error"
                onClose={() => setError("")} // Clear error when the user closes the alert
                sx={{ mt: 2, width: "100%" }}
              >
                {error}
              </Alert>
            )}
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
          </Box>
        )}
      </Paper>
    </Grid>
  );
}

export default ContractActions;

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

"use client";
import { Box, Button, Divider, TextField, Typography, CircularProgress, Alert } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useState, useEffect } from "react";
import useAccountAbstractionStore from "../../stores/accountAbstraccionStore";

function RelayTransaction() {
  const { chainId, relaySendTransaction, relayError ,balance} = useAccountAbstractionStore();

  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
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
      setError(relayError instanceof Error ? relayError.message : "An unknown error occurred");
    }
  }
  , [relayError]);

const checkBalance = () => {
  console.log("balance", balance);
  console.log("amount", amount);  

  if (Number(amount) > Number(balance)) {
    console.log("You don't have enough funds to send this amount");
    throw new Error("You don't have enough funds to send this amount");
  }
}

  const handleSendClick = async () => {
    setIsSending(true);
    setError(""); // Reset any previous errors
    try {
     checkBalance();
     const data = '0x'
      await relaySendTransaction(recipientAddress, amount, data);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
    setIsSending(false);
  };


 return (
    <Box
      display="flex"
      flexDirection="column"
      gap={2}
      alignItems="center"
      justifyContent="center"
      width={300}
      mx="auto"
    >
      <Typography fontWeight="700">Send {prefix}</Typography>
      <Divider sx={{ width: "100%", bgcolor: "gray", height: "1px" }} />

      <TextField
        label="Recipient Address"
        variant="outlined"
        fullWidth
        value={recipientAddress}
        onChange={(e) => setRecipientAddress(e.target.value)}
        disabled={isSending}
      />

      <TextField
        label="Amount to send"
        variant="outlined"
        fullWidth
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={isSending}
      />

      <Button
        startIcon={isSending ? <CircularProgress size={14} /> : <SendIcon />}
        variant="outlined"
        onClick={handleSendClick}
        disabled={isSending}
      >
        {isSending ? "Sending..." : "Send"}
      </Button>

      {error  && (
        <Alert
          severity="error"
          onClose={() => setError("")} // Clear error when the user closes the alert
          sx={{ mt: 2, width: '100%' }}
        >
          {error}
        </Alert>
      )}
    </Box>
  );
}

export default RelayTransaction;

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

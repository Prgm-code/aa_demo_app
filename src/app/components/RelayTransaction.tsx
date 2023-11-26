"use client";
import { Box, Button, Divider, TextField, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import SendIcon from "@mui/icons-material/Send";
import useAccountAbstractionStore from "../../stores/accountAbstraccionStore";

function RelayTransaction() {
  const { chainId, relaySendTransaction } = useAccountAbstractionStore();

  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [prefix, setPrefix] = useState("");

  useEffect(() => {
    if (chainId) {
      setPrefix(getPrefix(chainId));
    }
  }, [chainId]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={2}
      alignItems="center" // Centra los elementos en el eje horizontal
      justifyContent="center" // Centra los elementos en el eje vertical si es necesario
      width={300} // Establece un ancho fijo más pequeño
       // Añade un padding para que no esté todo tan pegado a los bordes
      mx="auto"
    >
      <Typography fontWeight="700">Send {prefix}</Typography>
      <Divider
        sx={{
          width: "100%",
         
          bgcolor: "gray", // Añade un color de fondo
          height: "1px", // Aumenta la altura del Divider para hacerlo más grueso
        }}
      />

      <TextField
        label="Recipient Address"
        variant="outlined"
        fullWidth
        value={recipientAddress}
        onChange={(e) => setRecipientAddress(e.target.value)}
      />

      <TextField
        label="Amount to send"
        variant="outlined"
        fullWidth
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <Button
        startIcon={<SendIcon />}
        variant="outlined"
        onClick={() => relaySendTransaction(recipientAddress, amount)}
      >
        Send
      </Button>
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
    case "0x137":
      return "matic";
    default:
      return "eth";
  }
};

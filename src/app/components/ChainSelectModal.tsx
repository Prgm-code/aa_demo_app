import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Backdrop,
  Fade,
  Typography,
  Button,
  LinearProgress,
  Stack
} from "@mui/material";
import ChainSelector from "./ChainSelector";
import useAccountAbstractionStore from "@/stores/accountAbstraccionStore";

function ChainSelectModal() {
  const { isInitialized, initialize } = useAccountAbstractionStore();
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleInitialize = async () => {
    setLoading(true);
    await initialize(); // Suponiendo que 'initialize' es una promesa
    // Si 'initialize' no es una promesa, debes gestionar el cierre del loader y del modal adecuadamente
  };

  useEffect(() => {
    if (isInitialized) {
      setLoading(false);
      setOpen(false);
    }
  }, [isInitialized]);

  return (
    <Modal
      open={open}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        style: { backgroundColor: 'rgba(0, 0, 0, 0.5)' } // Fondo oscurecido
      }}
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      disableEscapeKeyDown
      disableAutoFocus
      disableEnforceFocus
    >
      <Fade in={open}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'auto', // Tamaño automático según el contenido
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" id="transition-modal-title" sx={{ fontWeight: 'bold' }}>
            Initialize Network
          </Typography>
          <Typography id="transition-modal-description" sx={{ my: 2 }}>
            Please Select a Network to Initialize Account Abstraction
          </Typography>
          {loading ? (
            <LinearProgress sx={{ width: '100%', my: 1 }} />
          ) : (
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <ChainSelector />
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={handleInitialize}
                disabled={loading}
              >
                Initialize
              </Button>
            </Stack>
          )}
        </Box>
      </Fade>
    </Modal>
  );
}

export default ChainSelectModal;

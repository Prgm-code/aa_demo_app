"use client";
import {
  AppBar as MuiAppBar,
  Typography,
  styled,
  Box,
  Button,
  Avatar,
} from "@mui/material";
import { useEffect, useState } from "react";
import useAccountAbstractionStore from "../../stores/accountAbstraccionStore";
import { EthHashInfo } from "@safe-global/safe-react-components";

type AppBarProps = {
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  userInfo?: any;
};

const AppBar = () => {
  const {
    web3Provider,
    initialize,
    cleanUp,
    login,

    logout,
    isAuthenticated,
    userInfo,
    eoa,
    safes,
    // Asegúrate de incluir cualquier otra parte del estado que necesites
  } = useAccountAbstractionStore();

  useEffect(() => {
    initialize();
    return () => {
      cleanUp();
    };
  }, [initialize, cleanUp]);

  useEffect(() => {
    console.log("use Effect userInfo", userInfo);
    console.log("use Effect eoa", eoa);
    console.log("use Effect safes", safes);
    console.log("provider, ", web3Provider);
  }, [userInfo, eoa, safes, web3Provider]);

  return (
    <StyledAppBar position="static" color="default">
      <Typography variant="subtitle1" pl={4} fontWeight={700}>
        Account Abstraction Demo
      </Typography>

      <Box mr={5}>
        {isAuthenticated ? (
          <Box display="flex" alignItems="center" >
            {/* Agrega el Avatar aquí con un pequeño margen a la derecha */}
            <Avatar
              src={userInfo.profileImage}
              alt={userInfo.name || userInfo.email}
              sx={{ width: 45, height: 45, mr: 1 }}
            />
             <Box display="flex" alignItems="center" flexDirection="column" mr="2px" >
            <Typography variant="body1" fontWeight={700}>
              Hello {userInfo.name || userInfo.email} !!
            </Typography>
            <Typography 
            variant="caption"
            sx={{
              fontSize: '0.75rem', // Reduce el tamaño de la fuente
              color: 'black', // Cambia el color del texto
              mt: 0.5, // Margen superior para separar de la línea del nombre
            }}
            >
            <EthHashInfo
              address={eoa}
              showCopyButton
              showAvatar={false}
              hasExplorer={true}
              ExplorerButtonProps={{
                title: "View on Etherscan",
                href: `https://etherscan.io/address/${eoa}`,
              }}
            />
            </Typography>
            
            </Box>
            <Button
              variant="contained"
              onClick={logout}
              size="small" // Esto hace el botón más pequeño
              sx={{ ml: 2, py: 0.5, px: 2 }} // Ajusta el padding vertical (py) y horizontal (px) según necesites
            >
              Logout
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            onClick={login}
            size="small" // Esto hace el botón más pequeño
            sx={{ ml: 2, py: 0.5, px: 2 }} // Ajusta el padding vertical (py) y horizontal (px) según necesites
          >
            Login
          </Button>
        )}
      </Box>
    </StyledAppBar>
  );
};

const StyledAppBar = styled(MuiAppBar)`
  && {
    position: sticky;
    top: 0;
    // Aquí puedes cambiar el color de fondo; elige un color que se ajuste a tu paleta
    //background: #1976d2; // Un color azul sólido como ejemplo
    // O si prefieres un degradado, puedes usar algo como esto:
    background: linear-gradient(45deg, #fe6b8b 30%, #ff8e53 90%);
    height: 70px;
    align-items: center;
    justify-content: space-between;
    flex-direction: row;
    border-bottom: 2px solid ${({ theme }) => theme.palette.divider};
    box-shadow: none;
  }
`;
export default AppBar;

import styled from "@emotion/styled";
import { IconButton, Theme, Tooltip } from "@mui/material";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Link from "@mui/material/Link";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { GelatoRelayPack } from "@safe-global/relay-kit";
import { useCallback, useEffect } from "react";
import CloseIcon from '@mui/icons-material/Close';
import { TransactionStatusResponse } from "@gelatonetwork/relay-sdk";
import AddressLabel from "./AddressLabel";
import useApi from "@/hooks/useApi";
import getChain from "@/utils/getChain";
import useAccountAbstractionStore from "@/stores/accountAbstraccionStore";

type GelatoTaskStatusLabelProps = {
  gelatoTaskId: string;
  chainId: string | undefined;
  transactionHash?: string;
  setTransactionHash: React.Dispatch<React.SetStateAction<string>>;
};

const pollingTime = 4_000; // 4 seconds of polling time to update the Gelato task status

// TODO: rename this to TrackGelatoTaskStatus
const GelatoTaskStatusLabel = ({
  gelatoTaskId,
  chainId,
  transactionHash,
  setTransactionHash,
}: GelatoTaskStatusLabelProps) => {
  const { clearTx } = useAccountAbstractionStore();




  const fetchGelatoTaskInfo = useCallback(
    async () => await new GelatoRelayPack().getTaskStatus(gelatoTaskId),
    [gelatoTaskId]
  );

  const { data: gelatoTaskInfo } = useApi(fetchGelatoTaskInfo, pollingTime);

  console.log("gelatoTaskInfo: ", gelatoTaskInfo);

  const chain = getChain(chainId);

  const isCancelled = gelatoTaskInfo?.taskState === "Cancelled";
  const isSuccess = gelatoTaskInfo?.taskState === "ExecSuccess";
  const isLoading = !isCancelled && !isSuccess;

  useEffect(() => {
    if (gelatoTaskInfo?.transactionHash) {
      setTransactionHash(gelatoTaskInfo.transactionHash);
    }
  }, [gelatoTaskInfo, setTransactionHash]);

  return (
    <Container
      display="flex"
      flexDirection="column"
      gap={2}
      alignItems="flex-start"
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography>Gelato Task details</Typography>
        {gelatoTaskInfo?.taskState === "ExecSuccess" && (
          <Tooltip title="Reset and start new transaction">
            <IconButton
              onClick={() => {
                // Función para limpiar el estado de la transacción
                clearTx();
              }}
              size="small"
              sx={{
                color: "text.primary",
                "&:hover": {
                  color: "text.secondary",
                },
                ml: 6,
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {isLoading && <LinearProgress sx={{ alignSelf: "stretch" }} />}

      {/* Status label */}
      {gelatoTaskInfo?.taskState ? (
        <StatusContainer taskStatus={gelatoTaskInfo.taskState}>
          <Typography variant="body2">
            {getGelatoTaskStatusLabel(gelatoTaskInfo.taskState)}
          </Typography>
        </StatusContainer>
      ) : (
        <Skeleton variant="text" width={100} height={20} />
      )}

      {/* Transaction hash */}
      {!isCancelled && (
        <Stack
          display="flex"
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          gap={2}
        >
          <Typography variant="body2">Transaction: </Typography>

          {transactionHash ? (
            <AddressLabel
              address={transactionHash}
              showBlockExplorerLink
              isTransactionAddress
              showCopyIntoClipboardButton={false}
            />
          ) : (
            <Skeleton variant="text" width={150} height={20} />
          )}
        </Stack>
      )}

      {/* Task extra info */}
      {gelatoTaskInfo?.lastCheckMessage && (
        <Typography variant="caption">
          {gelatoTaskInfo.lastCheckMessage}
        </Typography>
      )}
    </Container>
  );
};

export default GelatoTaskStatusLabel;

const Container = styled(Box)`
  max-width: 800px;
  margin: 0 auto;
  margin-top: 12px;
`;

const StatusContainer = styled("div")<{
  theme?: Theme;
  taskStatus: TransactionStatusResponse["taskState"];
}>(
  ({ theme, taskStatus }) => `
    margin-right: 8px;
    border-radius: 4px;
    padding: 4px 12px;
    background-color: ${getGelatoTaskStatusColor(taskStatus, theme)};
    color: ${theme.palette.getContrastText(
      getGelatoTaskStatusColor(taskStatus, theme)
    )};
    `
);

const getGelatoTaskStatusColor = (
  taskStatus: TransactionStatusResponse["taskState"],
  theme: Theme
) => {
  const colors: Record<TransactionStatusResponse["taskState"], string> = {
    CheckPending: theme.palette.warning.light,
    WaitingForConfirmation: theme.palette.info.light,
    ExecPending: theme.palette.info.light,
    ExecSuccess: theme.palette.success.light,
    Cancelled: theme.palette.error.light,
    ExecReverted: theme.palette.error.light,
    Blacklisted: theme.palette.error.light,
    NotFound: theme.palette.error.light,
  };

  return colors[taskStatus];
};

const getGelatoTaskStatusLabel = (
  taskStatus: TransactionStatusResponse["taskState"]
) => {
  const label: Record<TransactionStatusResponse["taskState"], string> = {
    CheckPending: "Pending",
    WaitingForConfirmation: "Waiting confirmations",
    ExecPending: "Executing",
    ExecSuccess: "Success",
    Cancelled: "Cancelled",
    ExecReverted: "Reverted",
    Blacklisted: "Blacklisted",
    NotFound: "Not Found",
  };

  return label[taskStatus];
};

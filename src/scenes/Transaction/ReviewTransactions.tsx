import React, { useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync } from "@fortawesome/free-solid-svg-icons";
import SafeServiceClient from "@safe-global/safe-service-client";
import { ethers } from "ethers";
import { TransactionUtils } from "../../utils/TransactionUtils";

function ReviewTransactions() {
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);
  const [transactionResponse, setTransactionResponse] = useState<string>("");
  const [executionResponse, setExecutionResponse] = useState<string>("");
  const [transactionUrl, setTransactionUrl] = useState<string>("");
  const [executionUrl, setExecutionUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const safeAddress = localStorage.getItem("safeAddress") || "";

  const fetchPendingTransactions = useCallback(async () => {
    const txServiceUrl = "https://safe-transaction-goerli.safe.global";
    const ethAdapter = await TransactionUtils.getEthAdapter(false);
    const safeService = new SafeServiceClient({ txServiceUrl, ethAdapter });
    const pendingResult = (
      await safeService.getPendingTransactions(safeAddress)
    ).results;
    setPendingTransactions(pendingResult);
  }, [safeAddress]);

  useEffect(() => {
    fetchPendingTransactions();
  }, [fetchPendingTransactions]);

  const handleRefresh = async () => {
    clearError();

    try {
      await fetchPendingTransactions();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to refresh transactions"
      );
    }
  };
   function clearError  ()  {   
    setError("");
  }


  const confirmTransaction = async (
    event: React.MouseEvent<HTMLButtonElement>,
    transactionHash: string
  ) => {
    event.preventDefault();
    clearError();

    try {
      const response = await TransactionUtils.confirmTransaction(
        safeAddress,
        transactionHash
      );
      setTransactionResponse(
        `Transaction confirmed with signature: ${response.response.signature} `
      );
      setTransactionUrl(
        `https://safe-transaction-goerli.safe.global/api/v1/multisig-transactions/${response.safeTxHash}`
      );
      
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error confirming transaction");
    }
  };

  const executeTransaction = async (
    event: React.MouseEvent<HTMLButtonElement>,
    transactionHash: string
  ) => {
    event.preventDefault();
    clearError();
    try {
      const response = await TransactionUtils.executeTransaction(
        safeAddress,
        transactionHash
      );
      setExecutionResponse(
        `Transaction executed hash: ${response.receipt?.transactionHash}`
      );
      setTransactionUrl(
        `https://safe-transaction-goerli.safe.global/api/v1/multisig-transactions/${response.safeTxHash}`
      );
      setExecutionUrl(
        `https://goerli.etherscan.io/tx/${response.receipt?.transactionHash}`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error confirming transaction");
    }
  };
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px", // Ajusta el padding según tus necesidades
        }}
      >
          <h4> Pending Transactions</h4>
        <button
          onClick={handleRefresh}
          className="btn btn-secondary my-3"
          title="Refresh Pending Transactions"
        >
          <FontAwesomeIcon icon={faSync} />
        </button>
      </div>
      <table className="table table-striped overflow-auto">
        <thead>
          <tr>
            <th>Hash</th>
            <th>Destination</th>
            <th>Amount</th>
            <th>Time</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {pendingTransactions.map((transaction) => (
            <tr key={transaction.hash}>
              <td>
                <a
                  href={`https://safe-transaction-goerli.safe.global/api/v1/multisig-transactions/${transaction.safeTxHash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {`${transaction.safeTxHash.substring(
                    0,
                    6
                  )}...${transaction.safeTxHash.substring(
                    transaction.safeTxHash.length - 4
                  )}`}
                </a>
              </td>
              <td>{transaction.to}</td>
              <td>{ethers.utils.formatUnits(transaction.value)}</td>
              <td>
                {new Date(transaction.submissionDate).toLocaleDateString()}{" "}
                {new Date(transaction.submissionDate).toLocaleTimeString()}
              </td>
              <td>
                <button
                  className="btn btn-primary btn-success my-2"
                  onClick={(event) =>
                    confirmTransaction(event, transaction.safeTxHash)
                  }
                >
                  Confirm
                </button>

                {transaction.confirmationsRequired <=
                  transaction.confirmations.length && (
                  <button
                    className="btn btn-primary btn-success my-2"
                    onClick={(event) =>
                      executeTransaction(event, transaction.safeTxHash)
                    }
                  >
                    Execute
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {transactionResponse && (
        <>
          <div className="alert alert-success">{transactionResponse}</div>
          <a href={transactionUrl} target="_blank" rel="noopener noreferrer">
            View Transaction at Safe
          </a>
        </>
      )}
      {executionResponse && (
        <>
          <div className="alert alert-success">{executionResponse}</div>
          <a href={transactionUrl} target="_blank" rel="noopener noreferrer">
            View Transaction at Safe
          </a>
          <a href={executionUrl} target="_blank" rel="noopener noreferrer">
            View Transaction at Etherscan
          </a>
        </>
      )}
      {error && <div className="alert alert-danger">{error}</div>}
    </div>
  );
}

export default ReviewTransactions;

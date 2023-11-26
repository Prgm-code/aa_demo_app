import React, { useState } from "react";
import { TransactionUtils } from "../../utils/TransactionUtils";

function CreateTransaction() {
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState(0);
  const [transactionHash, setTransactionHash] = useState("");
  const [transactionUrl, setTransactionUrl] = useState("");
  const [error, setError] = useState<string>("");

  function handleAddressChange(event: React.ChangeEvent<HTMLInputElement>) {
    setAddress(event.target.value);
  }

  function handleAmountChange(event: React.ChangeEvent<HTMLInputElement>) {
    setAmount(Number(event.target.value));
  }
  function clearError() {
    setError("");
  }

  async function createTransaction() {
    clearError()
    // Assuming createTransaction is an async function that returns a Promise
    try {
      const result = await TransactionUtils.createTransaction(
        localStorage.getItem("safeAddress") || "",
        address,
        amount
      );
      setTransactionHash(result.safeTxHash);
      setTransactionUrl(
        `https://safe-transaction-goerli.safe.global/api/v1/multisig-transactions/${result.safeTxHash}`
      );
      console.log(`Transaction created at ${result.safeTxHash}`);
    } catch (error) {
      console.error("Error creating transaction:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create transaction"
      );
      // Handle the error appropriately in the UI
    }
  }

  return (
    <div>
      <label>Destination Address</label>
      <input
        className="form-control mb-3"
        value={address}
        onChange={handleAddressChange}
      />

      <label>Amount to Send</label>
      <input
        type="number"
        className="form-control mb-3"
        value={amount}
        onChange={handleAmountChange}
      />
      <button className="btn btn-primary my-2" onClick={createTransaction}>
        Create Transaction
      </button>

      {transactionHash && (
        <div className="alert alert-success mt-3">
          Transaction Hash: {transactionHash}
          <br />
          View Transaction at Safe:{" "}
          <a href={transactionUrl} target="_blank" rel="noopener noreferrer">
            Here
          </a>
        </div>
      )}
      {error && <div className="alert alert-danger">{error}</div>}
    </div>
  );
}

export default CreateTransaction;

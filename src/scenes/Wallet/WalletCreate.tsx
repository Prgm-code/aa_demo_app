"use client";
import React, { useState } from "react";
import { TextUtils } from "../../utils/TextUtils";
import { TransactionUtils } from "../../utils/TransactionUtils";
import WalletManage from "./WalletManage";

function WalletCreate() {
  const [inputs, setInputs] = useState([
    { key: TextUtils.randomString(), value: "" },
  ]);
  // usestate for threshold
  const [threshold, setThreshold] = useState(1);
  // usestate for safe address
  const [safeAddress, setSafeAddress] = useState(
    localStorage.getItem("safeAddress") || ""
  );
  const [transactionResponse, setTransactionResponse] = useState(""); // Nuevo estado para almacenar la respuesta de la transacción
  const [transactionUrls, setTransactionUrls] = useState({
    etherscanUrl: "",
    safeGlobalUrl: "",
  });
  const [error, setError] = useState<string>("");

  const addInput = () => {
    setInputs([...inputs, { key: TextUtils.randomString(), value: "" }]);
  };
  function clearError() {
    setError("");
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newInputs = [...inputs];
    newInputs[index].value = e.target.value;
    setInputs(newInputs);
  };

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setThreshold(Number.parseInt(e.target.value));
  };

  const removeInput = (inputToRemove: any) => {
    setInputs(inputs.filter((input, i) => input.key !== inputToRemove.key));
  };

  const createWallet = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    clearError();
    console.log(inputs);
    try {
      const { safe } = await TransactionUtils.createMultisigWallet(
        inputs.map((input) => input.value),
        threshold
      );
      const newSafeAddress = safe.getAddress();
      console.log(`Safe created at ${newSafeAddress}`);
      console.log(`https://goerli.etherscan.io/address/${newSafeAddress}`);
      console.log(`https://app.safe.global/gor:${newSafeAddress}`);
      const response = `Safe created at ${newSafeAddress}\nhttps://goerli.etherscan.io/address/${newSafeAddress}\nhttps://app.safe.global/gor:${newSafeAddress}`;
      setTransactionResponse(response);
      setTransactionUrls({
        etherscanUrl: `https://goerli.etherscan.io/address/${newSafeAddress}`,
        safeGlobalUrl: `https://app.safe.global/gor:${newSafeAddress}`,
      });
      setSafeAddress(newSafeAddress);

      console.log(safe);
    } catch (error) {
      console.error("Error creating transaction:", error);
      setError(
        error instanceof Error ? error.message : "Error creating transaction"
      );
    }
  };

  return (
    <div>
      <div className="EventDetail container card shadow my-5 p-5">
        <h1 className="text-center mb-3">Create a Wallet</h1>
        <form>
          {inputs.map((input, index) => (
            <div key={input.key} className="form-group">
              <input
                type="text"
                className="form-control"
                placeholder={`Owner ${index + 1} Address`}
                value={input.value}
                onChange={(e) => handleInputChange(e, index)}
              />
              <button
                type="button"
                className="btn btn-outline-danger my-2"
                onClick={() => removeInput(input)}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline-primary my-2"
            onClick={addInput}
          >
            Add Another Owner
          </button>
          <div>
            <hr />

            <label>Owners needed to approve a transaction</label>
            <input
              type="number"
              className="form-control"
              value={threshold || inputs.length}
              onChange={handleThresholdChange}
            />
          </div>
          <button className="btn btn-primary my-2" onClick={createWallet}>
            Create Wallet%
          </button>
        </form>
        <hr />
        {transactionResponse && (
          <div className="alert alert-success">
            <h4>Transaction Response:</h4>
            <pre>{transactionResponse}</pre>
            <p>
              <a
                href={transactionUrls.etherscanUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Etherscan
              </a>
            </p>
            <p>
              <a
                href={transactionUrls.safeGlobalUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Safe Global
              </a>
            </p>
          </div>
        )}
        
        {error && <div className="alert alert-danger">{error}</div>}

        <h3 className="text-center mb-3">Load a Wallet</h3>
        <input
          type="text"
          className="form-control"
          placeholder={`Existing Safe Address`}
          value={safeAddress}
          onChange={(e) => setSafeAddress(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-outline-primary my-2"
          onClick={() => {
            localStorage.setItem("safeAddress", safeAddress);
          }}
        >
          Save Safe Address to Local Storage
        </button>
      </div>
      <WalletManage />
    </div>
  );
}

export default WalletCreate;

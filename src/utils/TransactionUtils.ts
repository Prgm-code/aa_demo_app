import { ExternalProvider } from '@ethersproject/providers';
import { ethers } from "ethers"
import EthersAdapter from '@safe-global/safe-ethers-lib'
import Safe, { SafeFactory, SafeAccountConfig } from '@safe-global/safe-core-sdk'
import { SafeTransactionDataPartial } from "@safe-global/safe-core-sdk-types"
import SafeServiceClient from '@safe-global/safe-service-client'
import useAccountAbstractionStore from "../stores/accountAbstraccionStore"



declare global {
    interface Window {
        ethereum:any
    }
}

export class TransactionUtils {


    

    static getEthAdapter = async (useSigner: boolean = true) => {

        const { web3Provider, signer } = useAccountAbstractionStore.getState();



        // Verifica que la red es Goerli (cuyo chainId es 5)
        /* if (chainId !== 5) {
            alert('You are not connected to the Goerli network. Please switch networks in your Ethereum provider.');
            throw new Error('Incorrect network: Please connect to the Goerli network.');
        }
       */
        // Verifica que el usuario tiene una cuenta de Ethereum
   

        console.log({ web3Provider, signer });
        console.log("Deploying safe");
        const ethAdapter = new EthersAdapter({
            ethers,
            signerOrProvider: signer || web3Provider,
        });

        return ethAdapter;
    }
    static createMultisigWallet =  async (owners: Array<string>, threshold: number) => {
        console.log({owners, threshold});
        const ethAdapter = await this.getEthAdapter();
        const safeFactory = await SafeFactory.create({ ethAdapter });

        console.log({ethAdapter, safeFactory});
        const safeAccountConfig: SafeAccountConfig = {
            owners,
            threshold,
            // optional
            //
        };
        const safe : Safe = await safeFactory.deploySafe({safeAccountConfig});
        const safeAddress = safe.getAddress();
        console.log(`Safe created at ${safeAddress}`);
        console.log (`https://goerli.etherscan.io/address/${safeAddress}`);
        console.log(`https://app.safe.global/gor:${safeAddress}`);

        return {safe }

    }

    static createTransaction : any = async (safeAddress: string, destination: string, amount: number|string) => {
        amount = ethers.utils.parseUnits(amount.toString(), 'ether').toString();
        const safeTransactionData: SafeTransactionDataPartial = {
            to: destination,
            data: '0x',
            value: amount,
        };

        const ethAdapter = await this.getEthAdapter();
        const safeSdk = await Safe.create({ ethAdapter, safeAddress });

        // Create a Safe transaction whit the provided parameters
        const safeTransaction = await safeSdk.createTransaction({safeTransactionData});

        //determionistic hash based on the transaction parameters
        const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);

        //sign to verifyt the transaction is coming from owner 1
        const senderSignature = await safeSdk.signTransactionHash(safeTxHash);

        const txServiceUrl = 'https://safe-transaction-goerli.safe.global';
        const safeService = new SafeServiceClient({ txServiceUrl, ethAdapter });
        await safeService.proposeTransaction({
            safeAddress,
            safeTransactionData : safeTransaction.data,
            safeTxHash,
            senderAddress: (await ethAdapter.getSignerAddress() )!,

            senderSignature: senderSignature.data, 
        });
        console.log(`Transaction created at ${safeTxHash}`);
        console.log(`https://safe-transaction-goerli.safe.global/api/v1/multisig-transactions/${safeTxHash}`)
        return {safeTxHash, safeTransaction};
    }

    static confirmTransaction = async (safeAddress: string, safeTxHash: string) => {
        const ethAdapter = await this.getEthAdapter();
        const safeServiceurl = 'https://safe-transaction-goerli.safe.global';
        const safeService = new SafeServiceClient({ txServiceUrl: safeServiceurl, ethAdapter });

        const safeSdk = await Safe.create({ ethAdapter, safeAddress }); 

        const signature = await safeSdk.signTransactionHash(safeTxHash);
        const response = await safeService.confirmTransaction(safeTxHash, signature.data);
        console.log(`Transaction confirmed at ${safeTxHash}`);
        console.log(`https://safe-transaction-goerli.safe.global/api/v1/multisig-transactions/${safeTxHash}`)
        console.log("response: ", response);
        return {response, safeTxHash};


        
    }

    static executeTransaction = async (safeAddress: string, safeTxHash: string) => {
        const ethAdapter = await this.getEthAdapter();
        const safeServiceurl = 'https://safe-transaction-goerli.safe.global';
        const safeService = new SafeServiceClient({ txServiceUrl: safeServiceurl, ethAdapter });

        const safeSdk = await Safe.create({ ethAdapter, safeAddress }); 

        const safeTransaction = await safeService.getTransaction(safeTxHash);
        const executeTxResponse = await safeSdk.executeTransaction(safeTransaction);

        const receipt = await executeTxResponse.transactionResponse?.wait();

        console.log(`Transaction executed at ${receipt?.transactionHash}`);
        console.log(`https://goerli.etherscan.io/tx/${receipt?.transactionHash}`)

        console.log(`Transaction confirmed to the safe Service :
        
        https://safe-transaction-goerli.safe.global/api/v1/multisig-transactions/${safeTxHash}`)
        return {receipt , safeTxHash};
        
    }
}
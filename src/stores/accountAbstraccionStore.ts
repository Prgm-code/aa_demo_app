
import Chain from '../models/Chain';
import { create } from "zustand";
import { Web3AuthModalPack, Web3AuthConfig } from "@safe-global/auth-kit";
import { Web3AuthOptions } from "@web3auth/modal";
import { ethers, utils, BigNumber } from "ethers";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { Web3AuthEventListener } from "../packs/web3auth/types";
import AccountAbstraction from "@safe-global/account-abstraction-kit-poc";
import { GelatoRelayPack } from "@safe-global/relay-kit";
import Safe,{ EthersAdapter } from '@safe-global/protocol-kit'
import { MetaTransactionData, MetaTransactionOptions } from '@safe-global/safe-core-sdk-types';
import getChain  from '@/utils/getChain';
import { initialChain } from '@/chains/chains';


import dotenv from "dotenv";

import {
  ADAPTER_EVENTS,
  CHAIN_NAMESPACES,
  SafeEventEmitterProvider,
  UserInfo,
  WALLET_ADAPTERS,
} from "@web3auth/base";
import GnosisSafeContractEthers from "@safe-global/safe-ethers-lib/dist/src/contracts/GnosisSafe/GnosisSafeContractEthers";
dotenv.config();



interface MetaTransactionOptions_ {
  gasLimit: string;
  gasToken?: string;
  isSponsored?: boolean;
}


const connectedHandler: Web3AuthEventListener = (data) =>
  console.log("CONNECTED", data);
const disconnectedHandler: Web3AuthEventListener = (data) =>
  console.log("DISCONNECTED", data);

// Define el tipo de estado y las acciones para TypeScript
interface AccountAbstractionState {
  isAuthenticated: boolean;
  initializeChain: boolean;
  isInitialized: boolean;
  userInfo: any; // Define un tipo más específico si es posible
  web3Provider: ethers.providers.Web3Provider;
  web3AuthModalPack?: Web3AuthModalPack;
  UserInfo?: UserInfo;
  safes: string[];
  safeSelected:  any;
  safeAccountAbstraction?: AccountAbstraction;
  eoa: string;
  isDeployed: any;
  signer?: ethers.Signer;
  address?: string;
  network?: ethers.providers.Network;
  chainId?: string;
  chain?: Chain;
  balance: undefined;
  ethAdapter?: Promise<any>;
  isRelayerLoading: boolean;
  gelatoTaskId?: string;
  relayError?: Error;
  modalPackError?: Error;
  // Acciones
  clearTx: () => void;
  setChainId: (newChainId: string) => void;
  relaySendTransaction: (address: string, amount: string) => Promise<void>;
  setBalance: (newBalance: any) => void;
  getSafeAddress: () => Promise<void>;
  initialize: () => Promise<void>;
  cleanUp: () => void;
  login: () => Promise<void>;
  logout: () => void;

}

// Crea la store con Zustand
const useAccountAbstractionStore = create<AccountAbstractionState>(
  (set, get) => ({
    // Estado inicial
    initializeChain: false,
    isInitialized: false,
    isAuthenticated: false,
    userInfo: {},
    web3Provider: {} as ethers.providers.Web3Provider,
    web3AuthModalPack: undefined,
    UserInfo: undefined,
    safes: [],
    safeSelected: null,
    safeAccountAbstraction: undefined,
    eoa: "",
    isRelayerLoading: false, 
    gelatoTaskId: undefined,
    isDeployed: false,
    signer: {} as ethers.Signer,
    address: "",
    network: {} as ethers.providers.Network,
    chainId: "0x5",
    balance: undefined,
    ethAdapter: undefined,
    relayError: undefined,
    modalPackError: undefined,    
    // Acciones
    clearTx: () => set({ gelatoTaskId: undefined, relayError: undefined}),
    setBalance: (newBalance) => set({ balance: newBalance }),

    setChainId: (newChainId) => {
      const chain = getChain(newChainId) || initialChain;
      console.log("chain", chain);
      set({ chainId: newChainId, chain: chain });
    },


    initialize: async () => {
      const { chainId } = get();
      const  chain = getChain(chainId) || initialChain;
      console.log("chain", chain);
      set({ chain: chain });
  
      const options: Web3AuthOptions = {
        clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || "",
        web3AuthNetwork: "testnet",
        chainConfig: {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: chainId,
          rpcTarget: chain?.rpcUrl  //"https://rpc.ankr.com/eth_goerli",
        },
        uiConfig: {
          theme: "dark",
          loginMethodsOrder: ["google", "facebook"],
        },
      };

      const modalConfig = {
        [WALLET_ADAPTERS.TORUS_EVM]: {
          label: "torus",
          showOnModal: false,
        },
        [WALLET_ADAPTERS.METAMASK]: {
          label: "metamask",
          showOnDesktop: true,
          showOnMobile: false,
        },
      };

      const web3AuthConfig: Web3AuthConfig = {
        txServiceUrl: chain?.transactionServiceUrl,
      };

      const openloginAdapter = new OpenloginAdapter({
        loginSettings: {
          mfaLevel: "mandatory",
        },

        adapterSettings: {
          uxMode: "popup",

          whiteLabel: {
            name: "Safe",
          },
        },
      });
      const web3AuthModalPack = new Web3AuthModalPack(web3AuthConfig);
      try {
        await web3AuthModalPack.init({
          options,
          adapters: [openloginAdapter],
          modalConfig,
        });
        web3AuthModalPack.subscribe(ADAPTER_EVENTS.CONNECTED, connectedHandler);

        web3AuthModalPack.subscribe(
          ADAPTER_EVENTS.DISCONNECTED,
          disconnectedHandler
        );

        set({ web3AuthModalPack: web3AuthModalPack, 
              isInitialized: true,       
        });
      } catch (error) {
        console.error("Error en initialize:", error);
      }
    },

    login: async () => {
      const { web3AuthModalPack, isDeployed, getSafeAddress} = get(); //to get the current state
      if (!web3AuthModalPack) {
        console.error("Web3AuthModalPack no está inicializado.");
        set({ modalPackError: new Error("Web3AuthModalPack no está inicializado.") });
        return;
      }

      try {
        const authKitSignData = await web3AuthModalPack.signIn();
        console.log("authKitSignData", authKitSignData);
        const { safes, eoa } = authKitSignData;
        const provider =
          web3AuthModalPack.getProvider() as ethers.providers.ExternalProvider;
        const user = await web3AuthModalPack.getUserInfo();
        const web3Provider = new ethers.providers.Web3Provider(provider);
        const signer = web3Provider.getSigner();
        const address = await signer.getAddress();
        const network = await web3Provider.getNetwork();
        const chainId = "0x" + network.chainId.toString(16);
        console.log("address", address);
        console.log("network", network);
        console.log("chainId", chainId);
        console.log("user", user);
        console.log("safes", safes);
        console.log("eoa", eoa);

        set({
          isAuthenticated: true,
          userInfo: user,
          web3Provider: web3Provider,
          safes: safes || [],
          eoa: eoa,
          signer: signer,
          address: address,
          network: network,
          chainId: chainId,
        });
        if (!isDeployed) {
          await getSafeAddress();
        }
      } catch (error) {
        console.error("Login error:", error);
        set({ isAuthenticated: false });
      }
    },

    logout: () => {
      const { web3AuthModalPack } = get();
      if (web3AuthModalPack) {
        web3AuthModalPack.signOut();
      }
      set({
        isInitialized: false,
        isAuthenticated: false,
        userInfo: {},
        web3Provider: undefined,
        safes: [],
        eoa: "",
        safeSelected: null,
        safeAccountAbstraction: undefined,
        isDeployed: false,
        web3AuthModalPack: undefined,

        signer: undefined,
        address: "",
        network: undefined,
        chainId: "0x5",
      });
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    },

    cleanUp: () => {
      const { web3AuthModalPack } = get();
      if (web3AuthModalPack) {
        web3AuthModalPack.unsubscribe(
          ADAPTER_EVENTS.CONNECTED,
          connectedHandler
        );
        web3AuthModalPack.unsubscribe(
          ADAPTER_EVENTS.DISCONNECTED,
          disconnectedHandler
        );
      }
    },

    getSafeAddress: async () => {
      const { web3Provider, safes, signer } = get();
      if (web3Provider && safes && signer) {
    
        const relayPack = new GelatoRelayPack();
        const safeAccountAbstraction = new AccountAbstraction(signer);

        await safeAccountAbstraction.init({ relayPack });

        const hasSafes = safes.length > 0;

        const newSafe = hasSafes
          ? safes[0]
          : await safeAccountAbstraction.getSafeAddress();

        const isDeployed = await safeAccountAbstraction.isSafeDeployed();
        console.log("isDeployed", isDeployed);
        if (isDeployed) {
          set({ isDeployed: true });
        }
       /*  const ethAdapter = new EthersAdapter({
          ethers,
          signerOrProvider: signer,
        }); */



        set({
          safeSelected: newSafe,
          safeAccountAbstraction: safeAccountAbstraction,
        }); //
        

      }
    },
   // / implement relay-kit using Gelatoto send eth to an address
   relaySendTransaction: async (address: string, amount: string) => {
    const { web3Provider, safeSelected, isDeployed } = get();
    if (!web3Provider || !safeSelected) {
      set({ isRelayerLoading: true });
      set({ relayError: new Error("Web3 provider or Safe not initialized") });
      console.error("Web3 provider or Safe not initialized");
      return;
    }
  
    try {
      const signer = web3Provider.getSigner();
      const relayPack = new GelatoRelayPack();
      const safeAccountAbstraction = new AccountAbstraction(signer);
  
      await safeAccountAbstraction.init({ relayPack });
  
      const transactionData: MetaTransactionData[] = [
        {
          to: address,
          data: '0x',
          value: utils.parseUnits(amount, 'ether').toString(),
          operation: 0, // OperationType.Call
        },
      ];
  
      const options: MetaTransactionOptions_ = {
        isSponsored: false,
        gasLimit: "6000000", // In this alpha version we need to manually set the gas limit
        gasToken: ethers.constants.AddressZero, // Native token
      };
  
      const gelatoTaskId = await safeAccountAbstraction.relayTransaction(transactionData, options);
      set({ isRelayerLoading: false, gelatoTaskId: gelatoTaskId });
      console.log(`Transaction relayed with Gelato Task ID: ${gelatoTaskId}`);
      if (!isDeployed) {
        await safeAccountAbstraction.isSafeDeployed()
        set({ isDeployed: true });
      }
    } catch (error) {
      console.error(`Error relaying transaction: ${error}`);
      set({ isRelayerLoading: false, relayError: error as Error });
    }
  },
  })
);

export default useAccountAbstractionStore;

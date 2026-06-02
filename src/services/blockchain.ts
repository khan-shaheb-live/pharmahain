import { ethers } from "ethers";

// ABI of our Solidity Smart Contract
export const PHARMA_CHAIN_ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "string", "name": "batchId", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "medicineName", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "manufacturer", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "quantity", "type": "uint256" }
    ],
    "name": "BatchRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "string", "name": "batchId", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "string", "name": "batchId", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "verifier", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "indexed": false, "internalType": "bool", "name": "isGenuine", "type": "bool" },
      { "indexed": false, "internalType": "uint256", "name": "totalScans", "type": "uint256" }
    ],
    "name": "MedicineVerified",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_batchId", "type": "string" },
      { "internalType": "string", "name": "_medicineName", "type": "string" },
      { "internalType": "string", "name": "_manufacturerName", "type": "string" },
      { "internalType": "uint256", "name": "_quantity", "type": "uint256" },
      { "internalType": "uint256", "name": "_manufactureDate", "type": "uint256" },
      { "internalType": "uint256", "name": "_expiryDate", "type": "uint256" }
    ],
    "name": "registerMedicineBatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_batchId", "type": "string" },
      { "internalType": "address", "name": "_newOwner", "type": "address" },
      { "internalType": "string", "name": "_notes", "type": "string" }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_batchId", "type": "string" }
    ],
    "name": "verifyMedicine",
    "outputs": [
      { "internalType": "bool", "name": "isGenuine", "type": "bool" },
      { "internalType": "string", "name": "medicineName", "type": "string" },
      { "internalType": "address", "name": "currentOwner", "type": "address" },
      { "internalType": "uint256", "name": "totalScans", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_batchId", "type": "string" }
    ],
    "name": "getMedicineDetails",
    "outputs": [
      { "internalType": "string", "name": "batchId", "type": "string" },
      { "internalType": "string", "name": "medicineName", "type": "string" },
      { "internalType": "string", "name": "manufacturerName", "type": "string" },
      { "internalType": "address", "name": "manufacturerAddress", "type": "address" },
      { "internalType": "address", "name": "currentOwner", "type": "address" },
      { "internalType": "uint256", "name": "quantity", "type": "uint256" },
      { "internalType": "uint256", "name": "manufactureDate", "type": "uint256" },
      { "internalType": "uint256", "name": "expiryDate", "type": "uint256" },
      { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
      { "internalType": "uint256", "name": "scansCount", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_batchId", "type": "string" }
    ],
    "name": "getTransferHistory",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "from", "type": "address" },
          { "internalType": "address", "name": "to", "type": "address" },
          { "internalType": "uint256", "name": "transferDate", "type": "uint256" },
          { "internalType": "string", "name": "notes", "type": "string" }
        ],
        "internalType": "struct PharmaChain.TransferRecord[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Address of smart contract on Polygon Amoy Testnet (mock/placeholder to be customized by deployer)
export const PHARMA_CHAIN_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x9815EbFD5d82Bc846b55Da92bD121f158914B1bda";

export interface BlockchainTransaction {
  txHash: string;
  blockNumber: number;
  from: string;
  to: string;
  methodName: string;
  gasUsed: number;
  timestamp: string;
  batchId: string;
  eventLogs: string;
}

// Simulated On-Chain Sandbox State
const MOCK_BLOCKCHAIN_TXS: BlockchainTransaction[] = [
  {
    txHash: "0x8fa3f80c6be4b84b655da92bd121f158914b1bda1bda7ee72f91bf97aef4a52e",
    blockNumber: 4291880,
    from: "0x1bda7ee72f91bf97aef4a52e8fa3f80c6be4b84b",
    to: PHARMA_CHAIN_CONTRACT_ADDRESS,
    methodName: "registerMedicineBatch",
    gasUsed: 124500,
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    batchId: "BAT-77382-PZ",
    eventLogs: "BatchRegistered(BAT-77382-PZ, Amoxicillin Trihydrate 500mg, 0x1bda7ee..., 15000)"
  },
  {
    txHash: "0x98f654b121fb6589a1b1bda1bda7ee72f91bf97aef4a52e8fa3f80c6be4b84b6",
    blockNumber: 4291950,
    from: "0x1bda7ee72f91bf97aef4a52e8fa3f80c6be4b84b",
    to: PHARMA_CHAIN_CONTRACT_ADDRESS,
    methodName: "transferOwnership",
    gasUsed: 87200,
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    batchId: "BAT-77382-PZ",
    eventLogs: "OwnershipTransferred(BAT-77382-PZ, 0x1bda7ee..., 0x5e8fa3f..., 1774928100)"
  },
  {
    txHash: "0x43bda7ee72f91bf97aef4a52e8fa3f80c6be4b84b55da92bd121f158914b1bda",
    blockNumber: 4292100,
    from: "0x5e8fa3f80c6be4b84b655da92bd121f15",
    to: PHARMA_CHAIN_CONTRACT_ADDRESS,
    methodName: "transferOwnership",
    gasUsed: 87310,
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    batchId: "BAT-77382-PZ",
    eventLogs: "OwnershipTransferred(BAT-77382-PZ, 0x5e8fa3f..., 0x9bda7ee..., 1774945400)"
  },
  {
    txHash: "0x34d58ba25f829cc73595b121fb6589a1b1bda1bda7ee72f91bf97aef4a22e8310",
    blockNumber: 4292410,
    from: "0x1bda7ee72f91bf97aef4a52e8fa3f80c6be4b84b",
    to: PHARMA_CHAIN_CONTRACT_ADDRESS,
    methodName: "registerMedicineBatch",
    gasUsed: 125100,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    batchId: "BAT-55421-MD",
    eventLogs: "BatchRegistered(BAT-55421-MD, Lisinopril 10mg Tablets, 0x1bda7ee..., 20000)"
  },
  {
    txHash: "0x21fb6589a1b1bda1bda7ee72f91bf97aef4a22e831034d58ba25f829cc73595b1",
    blockNumber: 4292550,
    from: "0x1bda7ee72f91bf97aef4a52e8fa3f80c6be4b84b",
    to: PHARMA_CHAIN_CONTRACT_ADDRESS,
    methodName: "transferOwnership",
    gasUsed: 87250,
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    batchId: "BAT-55421-MD",
    eventLogs: "OwnershipTransferred(BAT-55421-MD, 0x1bda7ee..., 0x5e8fa3f..., 1775112400)"
  },
  {
    txHash: "0xe72a18ba5f829cc73595b121fb6589a1b1bda1bda7ee72f91bf97aef4a11f845",
    blockNumber: 4293021,
    from: "0x1bda7ee72f91bf97aef4a52e8fa3f80c6be4b84b",
    to: PHARMA_CHAIN_CONTRACT_ADDRESS,
    methodName: "registerMedicineBatch",
    gasUsed: 124300,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    batchId: "BAT-11029-CO",
    eventLogs: "BatchRegistered(BAT-11029-CO, Paracetamol 500mg, 0x1bda7ee..., 50000)"
  }
];

// Initialize local storage for block transactions
if (typeof window !== "undefined" && !localStorage.getItem("pc_blockchain_txs")) {
  localStorage.setItem("pc_blockchain_txs", JSON.stringify(MOCK_BLOCKCHAIN_TXS));
}

// Blockchain Helper Functions
export const blockchainService = {
  // Check if wallet is installed
  isWalletInstalled(): boolean {
    return typeof window !== "undefined" && (window as any).ethereum !== undefined;
  },

  // Connect user wallet and get address
  async connectWallet(): Promise<string> {
    if (this.isWalletInstalled()) {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        return accounts[0];
      } catch (error) {
        console.error("Wallet connection failed", error);
        throw new Error("Failed to connect wallet.");
      }
    } else {
      // Mock Wallet connection
      return "0x1bda7ee72f91bf97aef4a52e8fa3f80c6be4b84b";
    }
  },

  // Get active provider network
  async getConnectedNetwork(): Promise<string> {
    if (this.isWalletInstalled()) {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const network = await provider.getNetwork();
        return network.name + ` (Chain ID: ${network.chainId})`;
      } catch {
        return "Unknown Local Web3 Network";
      }
    }
    return "PharmaChain Simulated Sandbox (Polygon Amoy Testnet)";
  },

  // 1. REGISTER BATCH ON BLOCKCHAIN
  async registerMedicineBatch(
    batchId: string,
    medicineName: string,
    manufacturerName: string,
    quantity: number,
    manufactureDateTimestamp: number,
    expiryDateTimestamp: number
  ): Promise<string> {
    if (this.isWalletInstalled() && process.env.NEXT_PUBLIC_USE_REAL_BLOCKCHAIN === "true") {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(PHARMA_CHAIN_CONTRACT_ADDRESS, PHARMA_CHAIN_ABI, signer);

        const tx = await contract.registerMedicineBatch(
          batchId,
          medicineName,
          manufacturerName,
          quantity,
          manufactureDateTimestamp,
          expiryDateTimestamp
        );
        const receipt = await tx.wait();
        return receipt.hash;
      } catch (error: any) {
        console.error("Blockchain registration failed", error);
        throw new Error(error.message || "Failed to submit batch to blockchain.");
      }
    } else {
      // Sandbox Simulation
      const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      const currentBlock = Math.floor(4293021 + Math.random() * 500);
      const userAddress = await this.connectWallet();

      const newTx: BlockchainTransaction = {
        txHash,
        blockNumber: currentBlock,
        from: userAddress,
        to: PHARMA_CHAIN_CONTRACT_ADDRESS,
        methodName: "registerMedicineBatch",
        gasUsed: Math.floor(120000 + Math.random() * 10000),
        timestamp: new Date().toISOString(),
        batchId,
        eventLogs: `BatchRegistered(${batchId}, ${medicineName}, ${userAddress.substring(0, 8)}..., ${quantity})`
      };

      const txs = JSON.parse(localStorage.getItem("pc_blockchain_txs") || "[]");
      txs.unshift(newTx);
      localStorage.setItem("pc_blockchain_txs", JSON.stringify(txs));

      return txHash;
    }
  },

  // 2. TRANSFER OWNERSHIP ON BLOCKCHAIN
  async transferOwnership(batchId: string, newOwnerAddress: string, notes: string): Promise<string> {
    if (this.isWalletInstalled() && process.env.NEXT_PUBLIC_USE_REAL_BLOCKCHAIN === "true") {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(PHARMA_CHAIN_CONTRACT_ADDRESS, PHARMA_CHAIN_ABI, signer);

        const tx = await contract.transferOwnership(batchId, newOwnerAddress, notes);
        const receipt = await tx.wait();
        return receipt.hash;
      } catch (error: any) {
        console.error("Blockchain ownership transfer failed", error);
        throw new Error(error.message || "Failed to transfer ownership on blockchain.");
      }
    } else {
      // Sandbox Simulation
      const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      const currentBlock = Math.floor(4293521 + Math.random() * 500);
      const fromAddress = await this.connectWallet();
      const cleanNewOwner = newOwnerAddress.startsWith("0x") ? newOwnerAddress : "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

      const newTx: BlockchainTransaction = {
        txHash,
        blockNumber: currentBlock,
        from: fromAddress,
        to: PHARMA_CHAIN_CONTRACT_ADDRESS,
        methodName: "transferOwnership",
        gasUsed: Math.floor(85000 + Math.random() * 5000),
        timestamp: new Date().toISOString(),
        batchId,
        eventLogs: `OwnershipTransferred(${batchId}, ${fromAddress.substring(0, 8)}..., ${cleanNewOwner.substring(0, 8)}..., ${Math.floor(Date.now() / 1000)})`
      };

      const txs = JSON.parse(localStorage.getItem("pc_blockchain_txs") || "[]");
      txs.unshift(newTx);
      localStorage.setItem("pc_blockchain_txs", JSON.stringify(txs));

      return txHash;
    }
  },

  // 3. VERIFY MEDICINE ON BLOCKCHAIN
  async verifyMedicine(batchId: string): Promise<{ isGenuine: boolean; currentOwner: string; scansCount: number }> {
    if (this.isWalletInstalled() && process.env.NEXT_PUBLIC_USE_REAL_BLOCKCHAIN === "true") {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(PHARMA_CHAIN_CONTRACT_ADDRESS, PHARMA_CHAIN_ABI, signer);

        const tx = await contract.verifyMedicine(batchId);
        const receipt = await tx.wait();

        // Get updated details
        const details = await contract.getMedicineDetails(batchId);
        return {
          isGenuine: true,
          currentOwner: details[4],
          scansCount: Number(details[9])
        };
      } catch (error) {
        console.error("Blockchain verification call failed, trying read-only call...", error);
        // Fallback to read-only details
        try {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const contract = new ethers.Contract(PHARMA_CHAIN_CONTRACT_ADDRESS, PHARMA_CHAIN_ABI, provider);
          const details = await contract.getMedicineDetails(batchId);
          return {
            isGenuine: true,
            currentOwner: details[4],
            scansCount: Number(details[9])
          };
        } catch {
          return { isGenuine: false, currentOwner: ethers.ZeroAddress, scansCount: 0 };
        }
      }
    } else {
      // Sandbox Simulation: Look up in our local batches DB
      const batches = JSON.parse(localStorage.getItem("pc_batches") || "[]");
      const batch = batches.find((b: any) => b.batchId.toUpperCase() === batchId.toUpperCase());
      
      if (batch) {
        // Record scan event
        const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        const currentBlock = Math.floor(4294021 + Math.random() * 500);

        const scanTx: BlockchainTransaction = {
          txHash,
          blockNumber: currentBlock,
          from: "0x0000000000000000000000000000000000000000", // Customer/Guest
          to: PHARMA_CHAIN_CONTRACT_ADDRESS,
          methodName: "verifyMedicine",
          gasUsed: 45000,
          timestamp: new Date().toISOString(),
          batchId,
          eventLogs: `MedicineVerified(${batchId}, guest, ${Math.floor(Date.now() / 1000)}, true)`
        };

        const txs = JSON.parse(localStorage.getItem("pc_blockchain_txs") || "[]");
        txs.unshift(scanTx);
        localStorage.setItem("pc_blockchain_txs", JSON.stringify(txs));

        // Find how many scans in block explorer
        const count = txs.filter((t: any) => t.batchId === batchId && t.methodName === "verifyMedicine").length;

        return {
          isGenuine: true,
          currentOwner: batch.currentOwnerName,
          scansCount: count || 1
        };
      } else {
        return { isGenuine: false, currentOwner: "None", scansCount: 0 };
      }
    }
  },

  // Fetch block history explorer search
  async getTransactionReceipt(txHash: string): Promise<BlockchainTransaction | null> {
    const txs: BlockchainTransaction[] = JSON.parse(localStorage.getItem("pc_blockchain_txs") || "[]");
    return txs.find(t => t.txHash.toLowerCase() === txHash.toLowerCase()) || null;
  },

  async getAllTransactions(): Promise<BlockchainTransaction[]> {
    return JSON.parse(localStorage.getItem("pc_blockchain_txs") || "[]");
  }
};

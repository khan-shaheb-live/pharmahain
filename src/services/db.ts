import { db, auth } from "./firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  addDoc
} from "firebase/firestore";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";
import JsBarcode from "jsbarcode";

// Types & Interfaces
export type UserRole = "Super Admin" | "Manufacturer" | "Distributor" | "Pharmacy" | "Customer";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  organizationName: string;
  role: UserRole;
  createdAt: string;
}

export type BatchStatus = "Pending" | "In Transit" | "Delivered";

export interface MedicineBatch {
  batchId: string;
  medicineName: string;
  manufacturerName: string;
  manufacturerId: string;
  manufactureDate: string;
  expiryDate: string;
  quantity: number;
  blockchainHash: string;
  qrCodeUrl: string;
  barcodeBase64?: string;
  ingredients?: string;
  indications?: string;
  ingredientPercentages?: Array<{ name: string; percentage: number }>;
  currentOwnerId: string;
  currentOwnerName: string;
  status: BatchStatus;
  createdAt: string;
  distributorId?: string;
  distributorName?: string;
  pharmacyId?: string;
  pharmacyName?: string;
  wholesalePrice?: number;
  retailPrice?: number;
}

export interface OwnershipTransfer {
  transferId: string;
  batchId: string;
  medicineName: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  transferDate: string;
  blockchainTxHash: string;
  status: "Pending" | "Accepted" | "Rejected";
  notes?: string;
  wholesalePrice?: number;
}

export interface POSSale {
  saleId: string;
  batchId: string;
  medicineName: string;
  pharmacyId: string;
  pharmacyName: string;
  customerName: string;
  quantity: number;
  retailUnitPrice: number;
  totalPrice: number;
  saleDate: string;
}

export interface QRVerification {
  verificationId: string;
  batchId: string;
  medicineName: string;
  manufacturerName: string;
  customerIp: string;
  scanDate: string;
  verificationResult: boolean;
  onChainVerified: boolean;
}

// Helper to generate a barcode in Base64 string format (works on the client side during seeding/creation)
function generateBarcodeBase64(text: string): string {
  if (typeof window === "undefined") {
    return "";
  }
  try {
    const canvas = window.document.createElement("canvas");
    JsBarcode(canvas, text, {
      format: "CODE128",
      width: 1.5,
      height: 60,
      displayValue: true,
      font: "monospace",
      fontSize: 12,
      background: "#ffffff",
      lineColor: "#000000",
      margin: 20
    });
    return canvas.toDataURL("image/png");
  } catch (err) {
    console.error("Failed to generate Base64 barcode", err);
    return "";
  }
}

// Database Service Layer
export const dbService = {
  // ==========================================
  // AUTHENTICATION & PROFILE METHODS
  // ==========================================

  async registerUser(userData: Omit<UserProfile, "uid" | "createdAt"> & { password?: string }): Promise<UserProfile> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password || "password123"
      );
      const uid = userCredential.user.uid;

      // Set user profile in Auth
      await updateProfile(userCredential.user, {
        displayName: userData.name
      });

      // Set profile in Firestore
      const profile: UserProfile = {
        uid,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        organizationName: userData.organizationName,
        role: userData.role,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, "users", uid), profile);
      return profile;
    } catch (error: any) {
      throw new Error(error.message || "Failed to register user in Firebase.");
    }
  },

  async loginUser(email: string, password?: string): Promise<UserProfile> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password || "");
      const uid = userCredential.user.uid;
      
      // Fetch profile
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      } else {
        throw new Error("User profile not found in database.");
      }
    } catch (error: any) {
      throw new Error(error.message || "Login failed.");
    }
  },

  async logoutUser(): Promise<void> {
    await signOut(auth);
  },

  async getCurrentSessionUser(): Promise<UserProfile | null> {
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: any) => {
        unsubscribe();
        if (firebaseUser) {
          try {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            if (userDoc.exists()) {
              resolve(userDoc.data() as UserProfile);
            } else {
              resolve(null);
            }
          } catch {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
  },

  async forgotPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  async getAllUsers(): Promise<UserProfile[]> {
    const snapshot = await getDocs(collection(db, "users"));
    return snapshot.docs.map(doc => doc.data() as UserProfile);
  },

  // ==========================================
  // MEDICINE BATCHES METHODS
  // ==========================================

  async createBatch(batchData: Omit<MedicineBatch, "qrCodeUrl" | "currentOwnerId" | "currentOwnerName" | "status" | "createdAt"> & { wholesalePrice?: number }): Promise<MedicineBatch> {
    const defaultData = {
      currentOwnerId: batchData.manufacturerId,
      currentOwnerName: batchData.manufacturerName,
      status: "Pending" as BatchStatus,
      createdAt: new Date().toISOString(),
      qrCodeUrl: ""
    };

    const newBatch: MedicineBatch = {
      ...batchData,
      ...defaultData,
      wholesalePrice: batchData.wholesalePrice || 0
    };

    newBatch.qrCodeUrl = `/verify?batchId=${encodeURIComponent(newBatch.batchId)}`;
    newBatch.barcodeBase64 = generateBarcodeBase64(newBatch.batchId);

    await setDoc(doc(db, "medicine_batches", newBatch.batchId), newBatch);
    return newBatch;
  },

  async getBatch(batchId: string): Promise<MedicineBatch | null> {
    const docRef = doc(db, "medicine_batches", batchId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as MedicineBatch) : null;
  },

  async getAllBatches(): Promise<MedicineBatch[]> {
    const snapshot = await getDocs(collection(db, "medicine_batches"));
    return snapshot.docs.map(doc => doc.data() as MedicineBatch);
  },

  async getBatchesByRole(userId: string, role: UserRole): Promise<MedicineBatch[]> {
    let q;
    if (role === "Manufacturer") {
      q = query(collection(db, "medicine_batches"), where("manufacturerId", "==", userId));
    } else if (role === "Distributor") {
      q = query(collection(db, "medicine_batches"), where("distributorId", "==", userId));
    } else if (role === "Pharmacy") {
      q = query(collection(db, "medicine_batches"), where("pharmacyId", "==", userId));
    } else {
      q = query(collection(db, "medicine_batches"));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as MedicineBatch);
  },

  // ==========================================
  // OWNERSHIP & SHIPMENT TRANSFERS METHODS
  // ==========================================

  async initiateTransfer(
    batchId: string, 
    toUserId: string, 
    notes: string, 
    blockchainTxHash: string,
    wholesalePrice?: number
  ): Promise<OwnershipTransfer> {
    const batch = await this.getBatch(batchId);
    if (!batch) throw new Error("Batch not found.");

    const users = await this.getAllUsers();
    const toUser = users.find(u => u.uid === toUserId);
    if (!toUser) throw new Error("Recipient user profile not found.");

    const transferId = "TX_" + Math.random().toString(36).substring(2, 11);
    const newTransfer: OwnershipTransfer = {
      transferId,
      batchId,
      medicineName: batch.medicineName,
      fromUserId: batch.currentOwnerId,
      fromUserName: batch.currentOwnerName,
      toUserId: toUser.uid,
      toUserName: toUser.organizationName || toUser.name,
      transferDate: new Date().toISOString(),
      blockchainTxHash,
      status: "Pending",
      notes,
      wholesalePrice: wholesalePrice || 0
    };

    // 1. Save Transfer Doc
    await setDoc(doc(db, "ownership_transfers", transferId), newTransfer);
    
    // 2. Update Batch Assignee/Status in Firestore
    const batchRef = doc(db, "medicine_batches", batchId);
    const updateData: any = {
      status: "In Transit",
      wholesalePrice: wholesalePrice || batch.wholesalePrice || 0
    };

    if (toUser.role === "Distributor") {
      updateData.distributorId = toUser.uid;
      updateData.distributorName = toUser.organizationName || toUser.name;
    } else if (toUser.role === "Pharmacy") {
      updateData.pharmacyId = toUser.uid;
      updateData.pharmacyName = toUser.organizationName || toUser.name;
    }

    await updateDoc(batchRef, updateData);
    
    return newTransfer;
  },

  async respondToTransfer(transferId: string, accept: boolean): Promise<OwnershipTransfer> {
    const transRef = doc(db, "ownership_transfers", transferId);
    const transSnap = await getDoc(transRef);
    if (!transSnap.exists()) throw new Error("Transfer not found.");
    
    const transfer = transSnap.data() as OwnershipTransfer;
    const status = accept ? "Accepted" : "Rejected";
    
    await updateDoc(transRef, { status });
    transfer.status = status;

    if (accept) {
      const batchRef = doc(db, "medicine_batches", transfer.batchId);
      await updateDoc(batchRef, {
        currentOwnerId: transfer.toUserId,
        currentOwnerName: transfer.toUserName,
        status: "Delivered"
      });
    }

    return transfer;
  },

  async getTransfersForUser(userId: string): Promise<OwnershipTransfer[]> {
    const q1 = query(collection(db, "ownership_transfers"), where("toUserId", "==", userId));
    const q2 = query(collection(db, "ownership_transfers"), where("fromUserId", "==", userId));
    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    const map = new Map<string, OwnershipTransfer>();
    
    snap1.docs.forEach(doc => {
      const d = doc.data() as OwnershipTransfer;
      map.set(d.transferId, d);
    });
    snap2.docs.forEach(doc => {
      const d = doc.data() as OwnershipTransfer;
      map.set(d.transferId, d);
    });
    
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.transferDate).getTime() - new Date(a.transferDate).getTime()
    );
  },

  async getAllTransfers(): Promise<OwnershipTransfer[]> {
    const snapshot = await getDocs(collection(db, "ownership_transfers"));
    return snapshot.docs.map(doc => doc.data() as OwnershipTransfer);
  },

  // ==========================================
  // PUBLIC BARCODE/QR VERIFICATION METHODS
  // ==========================================

  async logVerification(batchId: string, result: boolean, onChain: boolean): Promise<QRVerification> {
    const batch = await this.getBatch(batchId);
    
    const ips = ["192.168.1.5", "172.16.54.21", "204.99.12.87", "98.122.5.34", "182.203.45.19"];
    const customerIp = ips[Math.floor(Math.random() * ips.length)];
    const verificationId = "V_" + Math.random().toString(36).substring(2, 11);

    const newLog: QRVerification = {
      verificationId,
      batchId,
      medicineName: batch ? batch.medicineName : "Unknown/Fake Medicine",
      manufacturerName: batch ? batch.manufacturerName : "Counterfeit Product",
      customerIp,
      scanDate: new Date().toISOString(),
      verificationResult: result,
      onChainVerified: onChain
    };

    await setDoc(doc(db, "qr_verifications", verificationId), newLog);
    return newLog;
  },

  async getAllVerifications(): Promise<QRVerification[]> {
    const snapshot = await getDocs(collection(db, "qr_verifications"));
    return snapshot.docs.map(doc => doc.data() as QRVerification);
  },

  // ==========================================
  // ANALYTICS & DASHBOARD METRICS
  // ==========================================

  async getAdminMetrics() {
    const users = await this.getAllUsers();
    const batches = await this.getAllBatches();
    const verifications = await this.getAllVerifications();

    const mfgCount = users.filter(u => u.role === "Manufacturer").length;
    const distCount = users.filter(u => u.role === "Distributor").length;
    const pharmCount = users.filter(u => u.role === "Pharmacy").length;

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const verificationTrends = days.map((day, idx) => {
      const factor = (idx + 1) * 3 + Math.floor(Math.random() * 5);
      const fails = Math.floor(Math.random() * 2);
      return {
        name: day,
        Genuine: factor,
        Counterfeit: fails
      };
    });

    const batchTrends = days.map((day, idx) => {
      return {
        name: day,
        Batches: Math.floor(Math.random() * 4) + idx % 2
      };
    });

    return {
      totalUsers: users.length,
      totalManufacturers: mfgCount,
      totalDistributors: distCount,
      totalPharmacies: pharmCount,
      totalBatches: batches.length,
      totalVerifications: verifications.length,
      verificationTrends,
      batchTrends
    };
  },

  // ==========================================
  // PHARMACY B2C POS SALES METHODS
  // ==========================================

  async registerPOSSale(saleData: Omit<POSSale, "saleId" | "saleDate" | "totalPrice">): Promise<POSSale> {
    const batch = await this.getBatch(saleData.batchId);
    if (!batch) throw new Error("Batch not found.");
    if (batch.quantity < saleData.quantity) {
      throw new Error(`Insufficient stock. Only ${batch.quantity} units available.`);
    }

    const saleId = "SALE_" + Math.random().toString(36).substring(2, 11);
    const totalPrice = Number((saleData.quantity * saleData.retailUnitPrice).toFixed(2));
    const newSale: POSSale = {
      ...saleData,
      saleId,
      totalPrice,
      saleDate: new Date().toISOString()
    };

    // 1. Save Sale Doc
    await setDoc(doc(db, "pos_sales", saleId), newSale);

    // 2. Decrement Batch stock
    const batchRef = doc(db, "medicine_batches", saleData.batchId);
    await updateDoc(batchRef, {
      quantity: batch.quantity - saleData.quantity,
      retailPrice: saleData.retailUnitPrice
    });

    return newSale;
  },

  async getSalesForPharmacy(pharmacyId: string): Promise<POSSale[]> {
    const q = query(collection(db, "pos_sales"), where("pharmacyId", "==", pharmacyId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as POSSale).sort(
      (a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()
    );
  },

  // ==========================================
  // BULK DATABASE SEED METHOD
  // ==========================================

  async seedDatabase(): Promise<string> {
    const SEED_USERS_MOCK = [
      {
        email: "admin@pharmachain.com",
        password: "admin123",
        name: "Dr. Sarah Connor",
        phone: "+1 555-0199",
        organizationName: "Global Pharma Regulatory Board",
        role: "Super Admin" as UserRole
      },
      {
        email: "mfg@pharmachain.com",
        password: "mfg123",
        name: "Pfizer Biotech Corp",
        phone: "+1 555-0211",
        organizationName: "Pfizer Laboratories Inc.",
        role: "Manufacturer" as UserRole
      },
      {
        email: "dist@pharmachain.com",
        password: "dist123",
        name: "Logistics Express",
        phone: "+1 555-0245",
        organizationName: "MedExpress Logistics Ltd.",
        role: "Distributor" as UserRole
      },
      {
        email: "pharmacy@pharmachain.com",
        password: "pharmacy123",
        name: "Walgreens Pharmacy Hub",
        phone: "+1 555-0288",
        organizationName: "Walgreens Care Pharmacies",
        role: "Pharmacy" as UserRole
      }
    ];

    const seededUserMap: Record<string, string> = {}; // email -> uid

    // 1. Seed Users
    for (const u of SEED_USERS_MOCK) {
      let uid = "";
      try {
        const creds = await createUserWithEmailAndPassword(auth, u.email, u.password);
        uid = creds.user.uid;
        await updateProfile(creds.user, { displayName: u.name });
      } catch (err: any) {
        if (err.code === "auth/email-already-in-use" || err.code === "auth/email-already-exists") {
          const q = query(collection(db, "users"), where("email", "==", u.email));
          const snap = await getDocs(q);
          if (!snap.empty) {
            uid = snap.docs[0].id;
          } else {
            try {
              const loginCreds = await signInWithEmailAndPassword(auth, u.email, u.password);
              uid = loginCreds.user.uid;
            } catch {
              uid = "usr_" + Math.random().toString(36).substring(2, 11);
            }
          }
        } else {
          uid = "usr_" + Math.random().toString(36).substring(2, 11);
        }
      }

      seededUserMap[u.email] = uid;

      const profile: UserProfile = {
        uid,
        name: u.name,
        email: u.email,
        phone: u.phone,
        organizationName: u.organizationName,
        role: u.role,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, "users", uid), profile);
    }

    const mfgId = seededUserMap["mfg@pharmachain.com"] || "mfg1";
    const distId = seededUserMap["dist@pharmachain.com"] || "dist1";
    const pharmId = seededUserMap["pharmacy@pharmachain.com"] || "pharm1";

    // 2. Seed Batches
    const SEED_BATCHES_MOCK: MedicineBatch[] = [
      {
        batchId: "BAT-77382-PZ",
        medicineName: "Amoxicillin Trihydrate 500mg",
        manufacturerName: "Pfizer Laboratories Inc.",
        manufacturerId: mfgId,
        manufactureDate: "2026-04-05",
        expiryDate: "2029-04-05",
        quantity: 25000,
        blockchainHash: "0x98f654b121fb6589a1b1bda1bda7ee72f91bf97aef4a52e8fa3f80c6be4b84b6",
        qrCodeUrl: `/verify?batchId=BAT-77382-PZ`,
        ingredients: "Amoxicillin Trihydrate, Magnesium Stearate",
        indications: "Bacterial Infections",
        currentOwnerId: pharmId,
        currentOwnerName: "Walgreens Care Pharmacies",
        status: "Delivered",
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        distributorId: distId,
        distributorName: "MedExpress Logistics Ltd.",
        pharmacyId: pharmId,
        pharmacyName: "Walgreens Care Pharmacies"
      },
      {
        batchId: "BAT-55421-MD",
        medicineName: "Lisinopril 10mg Tablets",
        manufacturerName: "Pfizer Laboratories Inc.",
        manufacturerId: mfgId,
        manufactureDate: "2026-04-12",
        expiryDate: "2029-04-12",
        quantity: 15000,
        blockchainHash: "0x21fb6589a1b1bda1bda7ee72f91bf97a22e831034d58ba25f829cc73595b121",
        qrCodeUrl: `/verify?batchId=BAT-55421-MD`,
        ingredients: "Lisinopril Dihydrate",
        indications: "High Blood Pressure",
        currentOwnerId: distId,
        currentOwnerName: "MedExpress Logistics Ltd.",
        status: "In Transit",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        distributorId: distId,
        distributorName: "MedExpress Logistics Ltd."
      },
      {
        batchId: "BAT-NAPA-201",
        medicineName: "Napa 500mg (Paracetamol)",
        manufacturerName: "Beximco Pharmaceuticals Ltd.",
        manufacturerId: mfgId,
        manufactureDate: "2026-04-10",
        expiryDate: "2029-04-10",
        quantity: 50000,
        blockchainHash: "0x8fa3f80c6be4b84b655da92bd121f158914b1bda1bda7ee72f91bf97aef4a52e",
        qrCodeUrl: `/verify?batchId=BAT-NAPA-201`,
        ingredients: "Paracetamol (Acetaminophen)",
        indications: "Pain Relief, Fever Reduction",
        currentOwnerId: pharmId,
        currentOwnerName: "Walgreens Care Pharmacies",
        status: "Delivered",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        distributorId: distId,
        distributorName: "MedExpress Logistics Ltd.",
        pharmacyId: pharmId,
        pharmacyName: "Walgreens Care Pharmacies"
      },
      {
        batchId: "BAT-ACE-302",
        medicineName: "Ace 500mg (Paracetamol)",
        manufacturerName: "Square Pharmaceuticals PLC",
        manufacturerId: mfgId,
        manufactureDate: "2026-05-01",
        expiryDate: "2029-05-01",
        quantity: 45000,
        blockchainHash: "0x34d58ba25f829cc73595b121fb6589a1b1bda1bda7ee72f91bf97aef4a22e8310",
        qrCodeUrl: `/verify?batchId=BAT-ACE-302`,
        ingredients: "Paracetamol (Acetaminophen)",
        indications: "Pain Relief, Fever Reduction",
        currentOwnerId: pharmId,
        currentOwnerName: "Walgreens Care Pharmacies",
        status: "Delivered",
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        distributorId: distId,
        distributorName: "MedExpress Logistics Ltd.",
        pharmacyId: pharmId,
        pharmacyName: "Walgreens Care Pharmacies"
      },
      {
        batchId: "BAT-SECLO-401",
        medicineName: "Seclo 20mg (Omeprazole)",
        manufacturerName: "Square Pharmaceuticals PLC",
        manufacturerId: mfgId,
        manufactureDate: "2026-03-15",
        expiryDate: "2028-03-15",
        quantity: 30000,
        blockchainHash: "0xe72a18ba5f829cc73595b121fb6589a1b1bda1bda7ee72f91bf97aef4a11f8452",
        qrCodeUrl: `/verify?batchId=BAT-SECLO-401`,
        ingredients: "Omeprazole USP",
        indications: "Acid Reflux",
        currentOwnerId: pharmId,
        currentOwnerName: "Walgreens Care Pharmacies",
        status: "Delivered",
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        distributorId: distId,
        distributorName: "MedExpress Logistics Ltd.",
        pharmacyId: pharmId,
        pharmacyName: "Walgreens Care Pharmacies"
      },
      {
        batchId: "BAT-SERGEL-502",
        medicineName: "Sergel 20mg (Esomeprazole)",
        manufacturerName: "Incepta Pharmaceuticals Ltd.",
        manufacturerId: mfgId,
        manufactureDate: "2026-05-12",
        expiryDate: "2028-05-12",
        quantity: 35000,
        blockchainHash: "0x12a8b9f654b121fb6589a1b1bda1bda7ee72f91bf97aef4a52e8fa3f80c6be4b84b",
        qrCodeUrl: `/verify?batchId=BAT-SERGEL-502`,
        ingredients: "Esomeprazole Magnesium Trihydrate",
        indications: "Acid Reflux, Inflammation",
        currentOwnerId: pharmId,
        currentOwnerName: "Walgreens Care Pharmacies",
        status: "Delivered",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        distributorId: distId,
        distributorName: "MedExpress Logistics Ltd.",
        pharmacyId: pharmId,
        pharmacyName: "Walgreens Care Pharmacies"
      },
      {
        batchId: "BAT-PANTO-603",
        medicineName: "Pantonix 20mg (Pantoprazole)",
        manufacturerName: "Incepta Pharmaceuticals Ltd.",
        manufacturerId: mfgId,
        manufactureDate: "2026-04-20",
        expiryDate: "2028-04-20",
        quantity: 25000,
        blockchainHash: "0x43bda7ee72f91bf97aef4a52e8fa3f80c6be4b84b655da92bd121f158914b1bda",
        qrCodeUrl: `/verify?batchId=BAT-PANTO-603`,
        ingredients: "Pantoprazole Sodium Sesquihydrate",
        indications: "Acid Reflux",
        currentOwnerId: pharmId,
        currentOwnerName: "Walgreens Care Pharmacies",
        status: "Delivered",
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        distributorId: distId,
        distributorName: "MedExpress Logistics Ltd.",
        pharmacyId: pharmId,
        pharmacyName: "Walgreens Care Pharmacies"
      },
      {
        batchId: "BAT-CEF3-704",
        medicineName: "Cef-3 200mg (Cefixime)",
        manufacturerName: "Active Biotech Labs",
        manufacturerId: mfgId,
        manufactureDate: "2026-05-18",
        expiryDate: "2028-05-18",
        quantity: 12000,
        blockchainHash: "0x21fb6589a1b1bda1bda7ee72f91bf97aef4a22e831034d58ba25f829cc73595b1",
        qrCodeUrl: `/verify?batchId=BAT-CEF3-704`,
        ingredients: "Cefixime Trihydrate",
        indications: "Bacterial Infections",
        currentOwnerId: distId,
        currentOwnerName: "MedExpress Logistics Ltd.",
        status: "In Transit",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        distributorId: distId,
        distributorName: "MedExpress Logistics Ltd."
      },
      {
        batchId: "BAT-ZIMAX-805",
        medicineName: "Zimax 500mg (Azithromycin)",
        manufacturerName: "Square Pharmaceuticals PLC",
        manufacturerId: mfgId,
        manufactureDate: "2026-05-22",
        expiryDate: "2029-05-22",
        quantity: 18000,
        blockchainHash: "0x98f654b121fb6589a1b1bda1bda7ee72f91bf97aef4a52e8fa3f80c6be4b84b6da",
        qrCodeUrl: `/verify?batchId=BAT-ZIMAX-805`,
        ingredients: "Azithromycin Dihydrate",
        indications: "Bacterial Infections",
        currentOwnerId: distId,
        currentOwnerName: "MedExpress Logistics Ltd.",
        status: "In Transit",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        distributorId: distId,
        distributorName: "MedExpress Logistics Ltd."
      },
      {
        batchId: "BAT-ALAT-906",
        medicineName: "Alatrol 10mg (Cetirizine)",
        manufacturerName: "Square Pharmaceuticals PLC",
        manufacturerId: mfgId,
        manufactureDate: "2026-05-10",
        expiryDate: "2029-05-10",
        quantity: 40000,
        blockchainHash: "0xba25f829cc73595b121fb6589a1b1bda1bda7ee72f91bf97aef4a22e831034d58",
        qrCodeUrl: `/verify?batchId=BAT-ALAT-906`,
        ingredients: "Cetirizine Hydrochloride",
        indications: "Allergy Relief, Cough & Cold",
        currentOwnerId: distId,
        currentOwnerName: "MedExpress Logistics Ltd.",
        status: "In Transit",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        distributorId: distId,
        distributorName: "MedExpress Logistics Ltd."
      },
      {
        batchId: "BAT-FEXO-107",
        medicineName: "Fexo 120mg (Fexofenadine)",
        manufacturerName: "Square Pharmaceuticals PLC",
        manufacturerId: mfgId,
        manufactureDate: "2026-05-15",
        expiryDate: "2029-05-15",
        quantity: 20000,
        blockchainHash: "0x89a1b1bda1bda7ee72f91bf97aef4a22e831034d58ba25f829cc73595b121fb65",
        qrCodeUrl: `/verify?batchId=BAT-FEXO-107`,
        ingredients: "Fexofenadine Hydrochloride",
        indications: "Allergy Relief",
        currentOwnerId: distId,
        currentOwnerName: "MedExpress Logistics Ltd.",
        status: "In Transit",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        distributorId: distId,
        distributorName: "MedExpress Logistics Ltd."
      },
      {
        batchId: "BAT-COMET-118",
        medicineName: "Comet 500mg (Metformin)",
        manufacturerName: "Square Pharmaceuticals PLC",
        manufacturerId: mfgId,
        manufactureDate: "2026-05-05",
        expiryDate: "2029-05-05",
        quantity: 60000,
        blockchainHash: "0x11fb6589a1b1bda1bda7ee72f91bf97a22e831034d58ba25f829cc73595b12",
        qrCodeUrl: `/verify?batchId=BAT-COMET-118`,
        ingredients: "Metformin Hydrochloride",
        indications: "Diabetes Management",
        currentOwnerId: distId,
        currentOwnerName: "MedExpress Logistics Ltd.",
        status: "In Transit",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        distributorId: distId,
        distributorName: "MedExpress Logistics Ltd."
      },
      {
        batchId: "BAT-LOSR-219",
        medicineName: "Losartan Plus 50mg",
        manufacturerName: "Incepta Pharmaceuticals Ltd.",
        manufacturerId: mfgId,
        manufactureDate: "2026-04-01",
        expiryDate: "2028-04-01",
        quantity: 35000,
        blockchainHash: "0x34d58ba25f829cc73595b121fb6589a1b1bda1bda7ee72f91bf97a22e831034d5",
        qrCodeUrl: `/verify?batchId=BAT-LOSR-219`,
        ingredients: "Losartan Potassium, Hydrochlorothiazide",
        indications: "High Blood Pressure",
        currentOwnerId: mfgId,
        currentOwnerName: "Pfizer Laboratories Inc.",
        status: "Pending",
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        batchId: "BAT-ECOS-320",
        medicineName: "Ecosprin 75mg (Aspirin)",
        manufacturerName: "Acme Laboratories Ltd.",
        manufacturerId: mfgId,
        manufactureDate: "2026-04-15",
        expiryDate: "2029-04-15",
        quantity: 80000,
        blockchainHash: "0x89cc73595b121fb6589a1b1bda1bda7ee72f91bf97a22e831034d58ba25f829cc",
        qrCodeUrl: `/verify?batchId=BAT-ECOS-320`,
        ingredients: "Aspirin USP",
        indications: "Heart Failure, Pain Relief",
        currentOwnerId: mfgId,
        currentOwnerName: "Pfizer Laboratories Inc.",
        status: "Pending",
        createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        batchId: "BAT-MONT-421",
        medicineName: "Montair 10mg (Montelukast)",
        manufacturerName: "Incepta Pharmaceuticals Ltd.",
        manufacturerId: mfgId,
        manufactureDate: "2026-05-10",
        expiryDate: "2029-05-10",
        quantity: 50000,
        blockchainHash: "0x121fb6589a1b1bda1bda7ee72f91bf97aef4a22e831034d58ba25f829cc73595b",
        qrCodeUrl: `/verify?batchId=BAT-MONT-421`,
        ingredients: "Montelukast Sodium",
        indications: "Allergy Relief, Cough & Cold",
        currentOwnerId: mfgId,
        currentOwnerName: "Pfizer Laboratories Inc.",
        status: "Pending",
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        batchId: "BAT-CALB-522",
        medicineName: "Calbo-D Tablets",
        manufacturerName: "Square Pharmaceuticals PLC",
        manufacturerId: mfgId,
        manufactureDate: "2026-05-02",
        expiryDate: "2029-05-02",
        quantity: 90000,
        blockchainHash: "0x73595b121fb6589a1b1bda1bda7ee72f91bf97a22e831034d58ba25f829cc7359",
        qrCodeUrl: `/verify?batchId=BAT-CALB-522`,
        ingredients: "Calcium Carbonate, Vitamin D3 (Cholecalciferol)",
        indications: "Pain Relief, Fever Reduction",
        currentOwnerId: mfgId,
        currentOwnerName: "Pfizer Laboratories Inc.",
        status: "Pending",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        batchId: "BAT-NERV-623",
        medicineName: "Nervalin 75mg (Pregabalin)",
        manufacturerName: "Incepta Pharmaceuticals Ltd.",
        manufacturerId: mfgId,
        manufactureDate: "2026-05-20",
        expiryDate: "2028-05-20",
        quantity: 15000,
        blockchainHash: "0xbda7ee72f91bf97a22e831034d58ba25f829cc73595b121fb6589a1b1bda1bda",
        qrCodeUrl: `/verify?batchId=BAT-NERV-623`,
        ingredients: "Pregabalin",
        indications: "Pain Relief, Inflammation",
        currentOwnerId: mfgId,
        currentOwnerName: "Pfizer Laboratories Inc.",
        status: "Pending",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    for (const b of SEED_BATCHES_MOCK) {
      b.barcodeBase64 = generateBarcodeBase64(b.batchId);
      if (b.batchId.includes("NAPA")) {
        b.wholesalePrice = 1.20;
        b.ingredientPercentages = [{ name: "Paracetamol", percentage: 100 }];
      } else if (b.batchId.includes("ACE")) {
        b.wholesalePrice = 1.10;
        b.ingredientPercentages = [{ name: "Paracetamol", percentage: 100 }];
      } else if (b.batchId.includes("SECLO")) {
        b.wholesalePrice = 2.40;
        b.ingredientPercentages = [{ name: "Omeprazole", percentage: 100 }];
      } else if (b.batchId.includes("SERGEL")) {
        b.wholesalePrice = 3.50;
        b.ingredientPercentages = [{ name: "Esomeprazole", percentage: 100 }];
      } else if (b.batchId.includes("PANTO")) {
        b.wholesalePrice = 2.80;
        b.ingredientPercentages = [{ name: "Pantoprazole", percentage: 100 }];
      } else if (b.batchId.includes("CEF3")) {
        b.wholesalePrice = 4.50;
        b.ingredientPercentages = [{ name: "Cefixime", percentage: 100 }];
      } else if (b.batchId.includes("ZIMAX")) {
        b.wholesalePrice = 6.00;
        b.ingredientPercentages = [{ name: "Azithromycin", percentage: 100 }];
      } else if (b.batchId.includes("ALAT")) {
        b.wholesalePrice = 1.50;
        b.ingredientPercentages = [{ name: "Cetirizine", percentage: 100 }];
      } else if (b.batchId.includes("FEXO")) {
        b.wholesalePrice = 2.20;
        b.ingredientPercentages = [{ name: "Fexofenadine", percentage: 100 }];
      } else if (b.batchId.includes("COMET")) {
        b.wholesalePrice = 1.80;
        b.ingredientPercentages = [{ name: "Metformin", percentage: 100 }];
      } else if (b.batchId.includes("LOSR")) {
        b.wholesalePrice = 3.20;
        b.ingredientPercentages = [{ name: "Losartan", percentage: 90 }, { name: "Hydrochlorothiazide", percentage: 10 }];
      } else if (b.batchId.includes("ECOS")) {
        b.wholesalePrice = 0.80;
        b.ingredientPercentages = [{ name: "Aspirin", percentage: 100 }];
      } else if (b.batchId.includes("MONT")) {
        b.wholesalePrice = 3.00;
        b.ingredientPercentages = [{ name: "Montelukast", percentage: 100 }];
      } else if (b.batchId.includes("CALB")) {
        b.wholesalePrice = 2.00;
        b.ingredientPercentages = [{ name: "Calcium Carbonate", percentage: 80 }, { name: "Vitamin D3", percentage: 20 }];
      } else if (b.batchId.includes("77382")) {
        b.wholesalePrice = 1.50;
        b.ingredientPercentages = [{ name: "Amoxicillin Trihydrate", percentage: 95 }, { name: "Magnesium Stearate", percentage: 5 }];
      } else if (b.batchId.includes("55421")) {
        b.wholesalePrice = 2.10;
        b.ingredientPercentages = [{ name: "Lisinopril Dihydrate", percentage: 100 }];
      } else if (b.batchId.includes("NERV")) {
        b.wholesalePrice = 5.50;
        b.ingredientPercentages = [{ name: "Pregabalin", percentage: 100 }];
      } else {
        b.wholesalePrice = 1.50;
        b.ingredientPercentages = [{ name: "Active Agent", percentage: 100 }];
      }

      if (b.status === "Delivered") {
        b.retailPrice = Number((b.wholesalePrice * 1.3).toFixed(2));
      }

      await setDoc(doc(db, "medicine_batches", b.batchId), b);
    }

    // 3. Seed Ownership Transfers
    const SEED_TRANSFERS_MOCK: OwnershipTransfer[] = [
      {
        transferId: "TX-9901-AM",
        batchId: "BAT-77382-PZ",
        medicineName: "Amoxicillin Trihydrate 500mg",
        fromUserId: mfgId,
        fromUserName: "Pfizer Laboratories Inc.",
        toUserId: distId,
        toUserName: "MedExpress Logistics Ltd.",
        transferDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        blockchainTxHash: "0x98f654b121fb6589a1b1bda1bda7ee72f91bf97aef4a52e8fa3f80c6be4b84b6",
        status: "Accepted",
        notes: "Shipped in cold container. Temp: 4C.",
        wholesalePrice: 1.50
      },
      {
        transferId: "TX-9902-AM",
        batchId: "BAT-77382-PZ",
        medicineName: "Amoxicillin Trihydrate 500mg",
        fromUserId: distId,
        fromUserName: "MedExpress Logistics Ltd.",
        toUserId: pharmId,
        toUserName: "Walgreens Care Pharmacies",
        transferDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        blockchainTxHash: "0x43bda7ee72f91bf97aef4a52e8fa3f80c6be4b84b655da92bd121f158914b1bda",
        status: "Accepted",
        notes: "Delivered to pharmacy hub. Secure packaging intact.",
        wholesalePrice: 1.75
      },
      {
        transferId: "TX-9903-AM",
        batchId: "BAT-55421-MD",
        medicineName: "Lisinopril 10mg Tablets",
        fromUserId: mfgId,
        fromUserName: "Pfizer Laboratories Inc.",
        toUserId: distId,
        toUserName: "MedExpress Logistics Ltd.",
        transferDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        blockchainTxHash: "0x21fb6589a1b1bda1bda7ee72f91bf97aef4a22e831034d58ba25f829cc73595b1",
        status: "Accepted",
        notes: "Assigned for standard dispatch.",
        wholesalePrice: 2.10
      }
    ];

    for (const t of SEED_TRANSFERS_MOCK) {
      await setDoc(doc(db, "ownership_transfers", t.transferId), t);
    }

    // 4. Seed Verifications
    const SEED_VERIFICATIONS_MOCK: QRVerification[] = [
      {
        verificationId: "V-1001",
        batchId: "BAT-77382-PZ",
        medicineName: "Amoxicillin Trihydrate 500mg",
        manufacturerName: "Pfizer Laboratories Inc.",
        customerIp: "192.168.1.45",
        scanDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        verificationResult: true,
        onChainVerified: true
      },
      {
        verificationId: "V-1002",
        batchId: "BAT-77382-PZ",
        medicineName: "Amoxicillin Trihydrate 500mg",
        manufacturerName: "Pfizer Laboratories Inc.",
        customerIp: "172.56.21.109",
        scanDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        verificationResult: true,
        onChainVerified: true
      },
      {
        verificationId: "V-1003",
        batchId: "BAT-FAKE-99",
        medicineName: "Paracetamol 500mg (Counterfeit)",
        manufacturerName: "Unknown Vendor",
        customerIp: "203.44.112.56",
        scanDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        verificationResult: false,
        onChainVerified: false
      }
    ];

    for (const v of SEED_VERIFICATIONS_MOCK) {
      await setDoc(doc(db, "qr_verifications", v.verificationId), v);
    }

    // 5. Seed B2C POS Sales
    const SEED_POS_SALES_MOCK: POSSale[] = [
      {
        saleId: "SALE-101",
        batchId: "BAT-NAPA-201",
        medicineName: "Napa 500mg (Paracetamol)",
        pharmacyId: pharmId,
        pharmacyName: "Walgreens Care Pharmacies",
        customerName: "Alice Smith",
        quantity: 120,
        retailUnitPrice: 1.60,
        totalPrice: 192.00,
        saleDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        saleId: "SALE-102",
        batchId: "BAT-ACE-302",
        medicineName: "Ace 500mg (Paracetamol)",
        pharmacyId: pharmId,
        pharmacyName: "Walgreens Care Pharmacies",
        customerName: "Bob Jones",
        quantity: 80,
        retailUnitPrice: 1.45,
        totalPrice: 116.00,
        saleDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        saleId: "SALE-103",
        batchId: "BAT-SECLO-401",
        medicineName: "Seclo 20mg (Omeprazole)",
        pharmacyId: pharmId,
        pharmacyName: "Walgreens Care Pharmacies",
        customerName: "Charlie Brown",
        quantity: 50,
        retailUnitPrice: 3.10,
        totalPrice: 155.00,
        saleDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      }
    ];

    for (const s of SEED_POS_SALES_MOCK) {
      await setDoc(doc(db, "pos_sales", s.saleId), s);
    }

    return "Database seeded successfully!";
  }
};

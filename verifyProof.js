import fs from "fs";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { ethers } from "ethers";
import * as snarkjs from "snarkjs";

dotenv.config();

const proofRaw = JSON.parse(fs.readFileSync("build/proof.json", "utf8"));
const publicSignalsRaw = JSON.parse(fs.readFileSync("build/public.json", "utf8"));

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;
const CHAIN_ID = process.env.CHAIN_ID;

const a = [
  (proofRaw.pi_a[0]),
  (proofRaw.pi_a[1])
];

const b = [
  [
    (proofRaw.pi_b[0][1]), 
    (proofRaw.pi_b[0][0])
  ],
  [
    (proofRaw.pi_b[1][1]),
    (proofRaw.pi_b[1][0])
  ]
];


const c = [
  (proofRaw.pi_c[0]),
  (proofRaw.pi_c[1])
];

const pubSignals = publicSignalsRaw;

function bigIntToString(obj) {
  if (typeof obj === "bigint") return obj.toString();
  if (Array.isArray(obj)) return obj.map(bigIntToString);
  if (obj !== null && typeof obj === "object") {
    const res = {};
    for (const key in obj) res[key] = bigIntToString(obj[key]);
    return res;
  }
  return obj;
}

const requestBody = bigIntToString({ a, b, c, pubSignals });

const body = {
  calls: [
    {
      contractAddress: CONTRACT_ADDRESS,
      method: `function verifyProof(uint256[2] _pA, uint256[2][2] _pB, uint256[2] _pC, uint256[${pubSignals.length}] _pubSignals) view returns (bool)`,
      params: [requestBody.a, requestBody.b, requestBody.c, requestBody.pubSignals]
    }
  ],
  chainId: CHAIN_ID
};

async function verifyThirdweb() {
  try {
    const response = await fetch("https://api.thirdweb.com/v1/contracts/read", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-secret-key": THIRDWEB_SECRET_KEY
      },
      body: JSON.stringify(body)
    });

    const result = await response.json();
    console.log("Thirdweb verifyProof result:", result.result);
  } catch (err) {
    console.error("Thirdweb Verification Error:", err);
  }
}

async function verifyOffChain() {
  try {
    const vkey = JSON.parse(fs.readFileSync("build/verification_key.json", "utf8"));
    const res = await snarkjs.groth16.verify(vkey, pubSignals, proofRaw);
    console.log("Off-chain verification result:", res);
  } catch (err) {
    console.error("Off-chain Verification Error:", err);
  }
}

console.log("🔹 Off-chain verification...");
await verifyOffChain();

console.log("🔹 Thirdweb contract verification...");
await verifyThirdweb();
process.exit(0); 
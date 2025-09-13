import fs from "fs";
import fetch from "node-fetch";
import dotenv from 'dotenv';
dotenv.config();

const proofRaw = JSON.parse(fs.readFileSync("build/proof.json"));
const publicSignalsRaw = JSON.parse(fs.readFileSync("build/public.json"));

const CONTRACT_ADDRESS=process.env.CONTRACT_ADDRESS;

const a = [BigInt(proofRaw.pi_a[0]), BigInt(proofRaw.pi_a[1])];

const b = [
  [BigInt(proofRaw.pi_b[0][0]), BigInt(proofRaw.pi_b[0][1])],
  [BigInt(proofRaw.pi_b[1][0]), BigInt(proofRaw.pi_b[1][1])]
];

const c = [BigInt(proofRaw.pi_c[0]), BigInt(proofRaw.pi_c[1])];

const pubSignals = publicSignalsRaw.map(s => BigInt(s));

const data = {
  a,
  b,
  c,
  pubSignals: pubSignals
};

function bigIntToString(obj) {
  if (typeof obj === "bigint") return obj.toString();
  if (Array.isArray(obj)) return obj.map(bigIntToString);
  if (obj !== null && typeof obj === "object") {
    const res = {};
    for (const key in obj) {
      res[key] = bigIntToString(obj[key]);
    }
    return res;
  }
  return obj;
}

const requestBody = bigIntToString(data)

const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;
const CHAIN_ID=process.env.CHAIN_ID;

const body = {
  calls: [
    {
      contractAddress: CONTRACT_ADDRESS,
      method: "function verifyProof(uint256[2] _pA, uint256[2][2] _pB, uint256[2] _pC, uint256[1] _pubSignals) view returns (bool)",
      params: [requestBody.a, requestBody.b, requestBody.c, requestBody.pubSignals]
    }
  ],
  chainId: CHAIN_ID
};

const response = await fetch("https://api.thirdweb.com/v1/contracts/read", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-secret-key": THIRDWEB_SECRET_KEY
  },
  body: JSON.stringify(body)
});

const result = await response.json();
console.log("Thirdweb verifyProof result:", result);

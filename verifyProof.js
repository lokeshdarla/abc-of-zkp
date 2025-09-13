import fs from "fs";
import fetch from "node-fetch";
import dotenv from 'dotenv';
dotenv.config();

const proofRaw = JSON.parse(fs.readFileSync("build/proof.json", "utf8"));
const publicSignalsRaw = JSON.parse(fs.readFileSync("build/public.json", "utf8"));

const CONTRACT_ADDRESS=process.env.CONTRACT_ADDRESS;

const a = [proofRaw.pi_a[0], proofRaw.pi_a[1]];

const b = [
  [proofRaw.pi_b[0][0], proofRaw.pi_b[0][1]],
  [proofRaw.pi_b[1][0], proofRaw.pi_b[1][1]]
];

const c = [proofRaw.pi_c[0], proofRaw.pi_c[1]];

const pubSignals = publicSignalsRaw;

const requestBody = {
  a,
  b,
  c,
  pubSignals: pubSignals
};

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

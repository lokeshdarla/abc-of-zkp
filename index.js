import fs from "fs";

// --- 1. Read proof.json and public.json ---
const proofRaw = JSON.parse(fs.readFileSync("build/proof.json", "utf8"));
const publicSignalsRaw = JSON.parse(fs.readFileSync("build/public.json", "utf8"));

// --- 2. Convert proof arrays to BigInt ---
const a = [BigInt(proofRaw.pi_a[0]), BigInt(proofRaw.pi_a[1])];

const b = [
  [BigInt(proofRaw.pi_b[0][0]), BigInt(proofRaw.pi_b[0][1])],
  [BigInt(proofRaw.pi_b[1][0]), BigInt(proofRaw.pi_b[1][1])]
];

const c = [BigInt(proofRaw.pi_c[0]), BigInt(proofRaw.pi_c[1])];

// --- 3. Convert public signals ---
const pubSignals = publicSignalsRaw.map(x => BigInt(x));

// --- 4. Convert BigInt to string for JSON ---
function bigIntToString(obj) {
  if (typeof obj === "bigint") return obj.toString();
  if (Array.isArray(obj)) return obj.map(bigIntToString);
  return obj;
}

const solidityReady = {
  a: bigIntToString(a),
  b: bigIntToString(b),
  c: bigIntToString(c),
  pubSignals: bigIntToString(pubSignals)
};

// --- 5. Save to JSON ---
fs.writeFileSync("build/solidity_proof.json", JSON.stringify(solidityReady, null, 2));

console.log("✅ Solidity-ready proof saved as strings in build/solidity_proof.json");

import * as snarkjs from "snarkjs";
import fs from "fs";

async function main() {
  // 1. Load inputs dynamically (or create them in JS)
  const input = {
    age: "25",
    landholding: "10",
    income: "5000"
  };

  // 2. Generate witness using circuit.wasm
  console.log("🟡 Generating witness...");
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    "build/kcc_eligibility_js/kcc_eligibility.wasm",
    "build/kcc_eligibility_final.zkey"
  );

  console.log("✅ Proof generated successfully!");
  console.log("Proof:", proof);
  console.log("Public signals:", publicSignals);

  // 3. Save proof.json and public.json
  fs.writeFileSync("build/proof.json", JSON.stringify(proof, null, 2));
  fs.writeFileSync("build/public.json", JSON.stringify(publicSignals, null, 2));

  // 4. (Optional) Verify proof off-chain before sending on-chain
  const vKey = JSON.parse(fs.readFileSync("build/verification_key.json", "utf8"));
  const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);

  console.log("🔍 Local Verification:", res ? "✅ Valid Proof" : "❌ Invalid Proof");
}

main().catch(console.error);

import * as snarkjs from "snarkjs";
import fs from "fs";

async function main() {
  const input = {
    age: "25",
    landholding: "10",
    income: "5000"
  };

  console.log("🟡 Generating witness...");
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    "build/kcc_eligibility_js/kcc_eligibility.wasm",
    "build/kcc_eligibility_final.zkey"
  );

  console.log("✅ Proof generated successfully!");
  console.log("Proof:", proof);
  console.log("Public signals:", publicSignals);

  fs.writeFileSync("build/proof.json", JSON.stringify(proof, null, 2));
  fs.writeFileSync("build/public.json", JSON.stringify(publicSignals, null, 2));
  process.exit(0);
}

main().catch(console.error);

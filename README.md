1. **Install Circom**
    
    ```
    git clone https://github.com/iden3/circom.git
    cd circom
    git checkout tags/v2.1.8
    cargo build --release
    cargo install --path circom
    
    ```
    
    - Clones the official Circom repository
    - Switches to version 2.1.8 (stable)
    - Builds it in release mode
    - Installs Circom globally so you can run `circom` anywhere
2. **Install snarkjs**
    
    ```
    npm install -g snarkjs
    
    ```
    
    - Installs snarkjs CLI globally via npm (needed for setup, proving, and verification)
3. **Compile Your Circuit**
    
    ```
    mkdir -p build
    circom kcc_eligibility.circom --r1cs --wasm --sym -o build
    
    ```
    
    - Creates a `build` folder
    - Compiles the `.circom` file into:
        - `.r1cs` → constraint system
        - `.wasm` → witness generator
        - `.sym` → symbol table for debugging
4. **Start Powers of Tau Ceremony (Phase 1)**
    
    ```
    snarkjs powersoftau new bn128 12 build/pot12_0000.ptau
    
    ```
    
    - Initializes a universal trusted setup for circuits with ≤ 2¹² constraints
    - Produces `pot12_0000.ptau` as the base file
5. **Contribute Entropy (Phase 1 Contribution)**
    
    ```
    snarkjs powersoftau contribute build/pot12_0000.ptau build/pot12_0001.ptau --name="First contribution"
    
    ```
    
    - Adds randomness to the setup to make it trustless
    - Produces `pot12_0001.ptau` with your contribution included
6. **Prepare Phase 2**
    
    ```
    snarkjs powersoftau prepare phase2 build/pot12_0001.ptau build/pot12_final.ptau
    
    ```
    
    - Converts the Phase 1 output into a Phase 2 file specifically usable for Groth16
7. **Groth16 Setup (Phase 2)**
    
    ```
    snarkjs groth16 setup build/kcc_eligibility.r1cs build/pot12_final.ptau build/kcc_eligibility_0000.zkey
    
    ```
    
    - Uses the circuit’s constraint system and the Phase 2 file to create a proving/verifying key
8. **Contribute More Randomness (Optional but Recommended)**
    
    ```
    snarkjs zkey contribute build/kcc_eligibility_0000.zkey build/kcc_eligibility_final.zkey --name="Final Contribution"
    ```
    
    - Adds additional entropy into the proving key
    - Produces `kcc_eligibility_final.zkey` (final proving/verifying key)
9. **Export Verification Key**
    
    ```
    snarkjs zkey export verificationkey build/kcc_eligibility_final.zkey build/verification_key.json
    
    ```
    
    - Extracts the verification key in JSON format (used to verify proofs on-chain or locally)
10. **Prepare Input File**
    
    File: build/input.json
    
    ```json
    {
      "age": 25,
      "landholding": 3,
      "income": 300000
    }
    
    ```
    
    - Stores your circuit’s private/public inputs
11. **Generate Witness**
    
    ```
    node build/kcc_eligibility_js/generate_witness.js build/kcc_eligibility_js/kcc_eligibility.wasm build/input.json build/witness.wtns
    
    ```
    
    - Runs the `.wasm` file with the given input to produce the witness file (`witness.wtns`)
12. **Generate Proof**
    
    ```
    snarkjs groth16 prove build/kcc_eligibility_final.zkey build/witness.wtns build/proof.json build/public.json
    ```
    
    - Generates a zero-knowledge proof (`proof.json`)
    - Produces `public.json` which contains public signals
13. **Verify Proof Locally**
    
    ```
    snarkjs groth16 verify build/verification_key.json build/public.json build/proof.json
    ```
    
    Expected Output:
    
    ```
    [INFO]  snarkJS: OK!
    ```
    
    - Verifies that the proof is valid given the verification key and public signals
14. **Export Solidity Verifier**
    
    ```
    snarkjs zkey export solidityverifier build/kcc_eligibility_final.zkey build/Verifier.sol
    ```
    
    - Generates a `Verifier.sol` smart contract to verify proofs on-chain

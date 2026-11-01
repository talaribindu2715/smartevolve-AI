import { ethers } from "hardhat";

async function main() {
  console.log("===============================================================");
  console.log("       SMARTEVOLVE AI — SMART CONTRACT GAS CONSUMPTION AUDIT   ");
  console.log("===============================================================");

  const [owner, issuer, unauthorized] = await ethers.getSigners();
  const gasPriceGwei = 20n; // 20 Gwei baseline
  const ethPriceUsd = 2600.0; // $2,600 / ETH

  function formatGas(gasUnits: bigint) {
    const costEth = (Number(gasUnits * gasPriceGwei) / 1e9);
    const costUsd = costEth * ethPriceUsd;
    return `${gasUnits.toLocaleString().padStart(10)} gas | ${costEth.toFixed(6)} ETH | $${costUsd.toFixed(4)} USD`;
  }

  // 1. Deployment Gas
  const Factory = await ethers.getContractFactory("SmartEvolveCredential");
  const deployTx = await Factory.getDeployTransaction();
  const estimatedDeployGas = await ethers.provider.estimateGas(deployTx);
  const contract = await Factory.deploy();
  await contract.waitForDeployment();
  const deployReceipt = await contract.deploymentTransaction()?.wait();
  const actualDeployGas = deployReceipt?.gasUsed ?? estimatedDeployGas;

  console.log(`\n1. Contract Deployment:`);
  console.log(`   Gas Used: ${formatGas(actualDeployGas)}`);

  // 2. Authorize Issuer Gas
  const authTx = await contract.setAuthorizedIssuer(issuer.address, true);
  const authReceipt = await authTx.wait();
  const authGas = authReceipt?.gasUsed ?? 0n;
  console.log(`\n2. setAuthorizedIssuer (Authorize new academic institution):`);
  console.log(`   Gas Used: ${formatGas(authGas)}`);

  // 3. Issue Credential Gas
  const credId = "cred-benchmark-" + Date.now();
  const studentHash = ethers.keccak256(ethers.toUtf8Bytes("student-user-simulation-001"));
  const title = "Data Analyst Career Certification";
  const dataHash = ethers.keccak256(ethers.toUtf8Bytes("Score:96|Level:Advanced|2026-11-01"));

  const issueTx = await contract.connect(issuer).issueCredential(credId, studentHash, title, dataHash);
  const issueReceipt = await issueTx.wait();
  const issueGas = issueReceipt?.gasUsed ?? 0n;
  console.log(`\n3. issueCredential (Mint tamper-evident credential record):`);
  console.log(`   Gas Used: ${formatGas(issueGas)}`);

  // 4. Verify Credential Gas (as state-modifying transaction with emit event)
  const verifyTx = await contract.connect(unauthorized).verifyCredential(credId, dataHash);
  const verifyReceipt = await verifyTx.wait();
  const verifyGas = verifyReceipt?.gasUsed ?? 0n;
  console.log(`\n4. verifyCredential (State-verifying on-chain transaction with event):`);
  console.log(`   Gas Used: ${formatGas(verifyGas)}`);

  // 5. Read-only Verification (Gasless EthCall)
  const [isValid] = await contract.connect(unauthorized).verifyCredential.staticCall(credId, dataHash);
  console.log(`\n5. verifyCredential (Static Call / Free Gasless Off-chain Read):`);
  console.log(`   Gas Used:          0 gas | 0.000000 ETH | $0.0000 USD (Read-Only)`);
  console.log(`   Verification Result: ${isValid ? "VALID ✓" : "INVALID ✗"}`);

  // 6. Revoke Credential Gas
  const revokeTx = await contract.connect(issuer).revokeCredential(credId);
  const revokeReceipt = await revokeTx.wait();
  const revokeGas = revokeReceipt?.gasUsed ?? 0n;
  console.log(`\n6. revokeCredential (Revoke compromised/disputed credential):`);
  console.log(`   Gas Used: ${formatGas(revokeGas)}`);

  // 7. isHashRegistered Read
  const isRegistered = await contract.isHashRegistered(dataHash);
  console.log(`\n7. isHashRegistered (Fast bytes32 lookup):`);
  console.log(`   Gas Used:          0 gas (Static View)`);
  console.log(`   Registered Status: ${isRegistered ? "TRUE" : "FALSE"}`);

  console.log("\n===============================================================");
  console.log("Gas Benchmark Summary Table:");
  console.log("---------------------------------------------------------------");
  console.log(`| Action               | Gas Units   | Cost (20 Gwei) | USD ($2600/ETH) |`);
  console.log(`|----------------------|-------------|----------------|-----------------|`);
  console.log(`| Contract Deploy      | ${actualDeployGas.toString().padStart(11)} | ${(Number(actualDeployGas * gasPriceGwei) / 1e9).toFixed(6).padStart(14)} | $${((Number(actualDeployGas * gasPriceGwei) / 1e9) * ethPriceUsd).toFixed(2).padStart(13)} |`);
  console.log(`| setAuthorizedIssuer  | ${authGas.toString().padStart(11)} | ${(Number(authGas * gasPriceGwei) / 1e9).toFixed(6).padStart(14)} | $${((Number(authGas * gasPriceGwei) / 1e9) * ethPriceUsd).toFixed(4).padStart(13)} |`);
  console.log(`| issueCredential      | ${issueGas.toString().padStart(11)} | ${(Number(issueGas * gasPriceGwei) / 1e9).toFixed(6).padStart(14)} | $${((Number(issueGas * gasPriceGwei) / 1e9) * ethPriceUsd).toFixed(4).padStart(13)} |`);
  console.log(`| verifyCredential(tx) | ${verifyGas.toString().padStart(11)} | ${(Number(verifyGas * gasPriceGwei) / 1e9).toFixed(6).padStart(14)} | $${((Number(verifyGas * gasPriceGwei) / 1e9) * ethPriceUsd).toFixed(4).padStart(13)} |`);
  console.log(`| verifyCredential(call|           0 |       0.000000 |         $0.0000 |`);
  console.log(`| revokeCredential     | ${revokeGas.toString().padStart(11)} | ${(Number(revokeGas * gasPriceGwei) / 1e9).toFixed(6).padStart(14)} | $${((Number(revokeGas * gasPriceGwei) / 1e9) * ethPriceUsd).toFixed(4).padStart(13)} |`);
  console.log("===============================================================\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


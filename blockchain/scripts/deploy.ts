import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("=================================================");
  console.log("Deploying SmartEvolveCredential Smart Contract...");
  console.log("=================================================");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer account:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");

  const SmartEvolveCredential = await ethers.getContractFactory("SmartEvolveCredential");
  const credentialContract = await SmartEvolveCredential.deploy();
  await credentialContract.waitForDeployment();

  const contractAddress = await credentialContract.getAddress();
  console.log("\n>>> SmartEvolveCredential successfully deployed to:", contractAddress);

  // Write contract address and ABI to backend config folder for automated Web3j integration
  const deployInfo = {
    contractAddress,
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployedAt: new Date().toISOString(),
  };

  const outputDir = path.join(__dirname, "../../backend/src/main/resources/blockchain");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, "deployment.json"),
    JSON.stringify(deployInfo, null, 2)
  );

  console.log("Deployment info exported to backend resources.");
  console.log("=================================================");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});

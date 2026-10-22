import { expect } from "chai";
import { ethers } from "hardhat";
import { SmartEvolveCredential } from "../typechain-types";

describe("SmartEvolveCredential Smart Contract", function () {
  let credentialContract: SmartEvolveCredential;
  let owner: any;
  let issuer: any;
  let student: any;
  let unauthorized: any;

  beforeEach(async function () {
    [owner, issuer, student, unauthorized] = await ethers.getSigners();

    const SmartEvolveCredentialFactory = await ethers.getContractFactory("SmartEvolveCredential");
    credentialContract = (await SmartEvolveCredentialFactory.deploy()) as unknown as SmartEvolveCredential;
    await credentialContract.waitForDeployment();

    // Authorize issuer
    await credentialContract.setAuthorizedIssuer(issuer.address, true);
  });

  it("should deploy with the correct owner and initial issuer authorization", async function () {
    expect(await credentialContract.owner()).to.equal(owner.address);
    expect(await credentialContract.authorizedIssuers(issuer.address)).to.be.true;
    expect(await credentialContract.authorizedIssuers(unauthorized.address)).to.be.false;
  });

  it("should allow an authorized issuer to issue a verifiable achievement credential", async function () {
    const credentialId = "cred-uuid-101";
    const studentIdHash = ethers.keccak256(ethers.toUtf8Bytes("student-user-42"));
    const achievementTitle = "Data Analyst Career Ready";
    const dataHash = ethers.keccak256(ethers.toUtf8Bytes("Data Analyst Ready|Score:95|2026-10-22"));

    const tx = await credentialContract
      .connect(issuer)
      .issueCredential(credentialId, studentIdHash, achievementTitle, dataHash);
    await tx.wait();

    const record = await credentialContract.getCredential(credentialId);
    expect(record.credentialId).to.equal(credentialId);
    expect(record.studentIdHash).to.equal(studentIdHash);
    expect(record.achievementTitle).to.equal(achievementTitle);
    expect(record.achievementDataHash).to.equal(dataHash);
    expect(record.issuer).to.equal(issuer.address);
    expect(record.revoked).to.be.false;
    expect(record.issuedAt).to.be.greaterThan(0);

    expect(await credentialContract.isHashRegistered(dataHash)).to.be.true;
  });

  it("should prevent duplicate credential ID or duplicate achievement hash registration", async function () {
    const credentialId = "cred-uuid-102";
    const studentIdHash = ethers.keccak256(ethers.toUtf8Bytes("student-user-43"));
    const title = "Python Mastery";
    const dataHash = ethers.keccak256(ethers.toUtf8Bytes("Python Mastery|Score:90"));

    await credentialContract
      .connect(issuer)
      .issueCredential(credentialId, studentIdHash, title, dataHash);

    // Attempting same credentialId
    await expect(
      credentialContract
        .connect(issuer)
        .issueCredential(credentialId, studentIdHash, "Different Title", ethers.keccak256(ethers.toUtf8Bytes("other")))
    ).to.be.revertedWith("Credential already exists");

    // Attempting duplicate achievement hash
    await expect(
      credentialContract
        .connect(issuer)
        .issueCredential("cred-uuid-103", studentIdHash, "Title", dataHash)
    ).to.be.revertedWith("Achievement hash already recorded");
  });

  it("should reject unauthorized callers from issuing credentials", async function () {
    const studentIdHash = ethers.keccak256(ethers.toUtf8Bytes("student-user-44"));
    const dataHash = ethers.keccak256(ethers.toUtf8Bytes("Fake Cert"));

    await expect(
      credentialContract
        .connect(unauthorized)
        .issueCredential("cred-fake", studentIdHash, "Fake Cert", dataHash)
    ).to.be.revertedWith("Not authorized to issue credentials");
  });

  it("should successfully verify on-chain records and detect invalid hashes", async function () {
    const credentialId = "cred-uuid-105";
    const studentIdHash = ethers.keccak256(ethers.toUtf8Bytes("student-user-45"));
    const title = "Spring Boot Microservices";
    const validDataHash = ethers.keccak256(ethers.toUtf8Bytes("Spring Boot 3.3.4 Evaluation Passed"));
    const wrongDataHash = ethers.keccak256(ethers.toUtf8Bytes("Manipulated Hash"));

    await credentialContract
      .connect(issuer)
      .issueCredential(credentialId, studentIdHash, title, validDataHash);

    // Verify valid hash
    const [isValid, recTitle, recIssuer, , isRevoked] = await credentialContract
      .connect(unauthorized)
      .verifyCredential.staticCall(credentialId, validDataHash);

    expect(isValid).to.be.true;
    expect(recTitle).to.equal(title);
    expect(recIssuer).to.equal(issuer.address);
    expect(isRevoked).to.be.false;

    // Verify with invalid hash
    const [isTamperedValid] = await credentialContract
      .connect(unauthorized)
      .verifyCredential.staticCall(credentialId, wrongDataHash);

    expect(isTamperedValid).to.be.false;
  });

  it("should allow revoking a credential and reflect revoked state in verification", async function () {
    const credentialId = "cred-uuid-106";
    const studentIdHash = ethers.keccak256(ethers.toUtf8Bytes("student-user-46"));
    const title = "Revocable Cert";
    const dataHash = ethers.keccak256(ethers.toUtf8Bytes("Revocable Data"));

    await credentialContract
      .connect(issuer)
      .issueCredential(credentialId, studentIdHash, title, dataHash);

    // Revoke
    await credentialContract.connect(issuer).revokeCredential(credentialId);

    const [isValid, , , , isRevoked] = await credentialContract
      .connect(unauthorized)
      .verifyCredential.staticCall(credentialId, dataHash);

    expect(isValid).to.be.false;
    expect(isRevoked).to.be.true;
  });
});

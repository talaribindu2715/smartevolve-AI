// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SmartEvolveCredential
 * @notice Tamper-evident, blockchain-backed credential and achievement verification
 *         for SmartEvolve AI students. Stores cryptographic achievement hashes
 *         without exposing personally identifiable information (PII) on-chain.
 */
contract SmartEvolveCredential {
    address public owner;

    struct CredentialRecord {
        string credentialId;
        bytes32 studentIdHash;
        string achievementTitle;
        bytes32 achievementDataHash;
        address issuer;
        uint256 issuedAt;
        bool revoked;
    }

    // Mapping from credentialId string to on-chain record
    mapping(string => CredentialRecord) private credentials;
    // Fast lookup for registered achievement hashes to prevent duplicate fraudulent registration
    mapping(bytes32 => bool) private registeredHashes;
    // Authorized issuers allowed to mint credentials
    mapping(address => bool) public authorizedIssuers;

    event CredentialIssued(
        string indexed credentialId,
        bytes32 indexed studentIdHash,
        bytes32 achievementDataHash,
        address indexed issuer,
        uint256 issuedAt
    );

    event CredentialRevoked(
        string indexed credentialId,
        address indexed revokedBy,
        uint256 revokedAt
    );

    event CredentialVerified(
        string indexed credentialId,
        bool isValid,
        address indexed verifier,
        uint256 verifiedAt
    );

    event IssuerUpdated(address indexed issuer, bool status);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can execute");
        _;
    }

    modifier onlyAuthorized() {
        require(msg.sender == owner || authorizedIssuers[msg.sender], "Not authorized to issue credentials");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedIssuers[msg.sender] = true;
    }

    /**
     * @notice Authorize or revoke an educational institution / backend issuer address
     */
    function setAuthorizedIssuer(address issuer, bool status) external onlyOwner {
        require(issuer != address(0), "Invalid issuer address");
        authorizedIssuers[issuer] = status;
        emit IssuerUpdated(issuer, status);
    }

    /**
     * @notice Issue a verifiable credential on-chain
     * @param credentialId Unique UUID or string identifier of the credential
     * @param studentIdHash Cryptographic hash (keccak256) of student identifier to preserve privacy
     * @param achievementTitle Plain text title of achievement (e.g. "Data Analyst Ready", "Python Mastery")
     * @param achievementDataHash SHA256/Keccak256 hash of credential metadata payload
     */
    function issueCredential(
        string calldata credentialId,
        bytes32 studentIdHash,
        string calldata achievementTitle,
        bytes32 achievementDataHash
    ) external onlyAuthorized returns (bool) {
        require(bytes(credentialId).length > 0, "Credential ID required");
        require(bytes(achievementTitle).length > 0, "Achievement title required");
        require(achievementDataHash != bytes32(0), "Invalid achievement hash");
        require(credentials[credentialId].issuedAt == 0, "Credential already exists");
        require(!registeredHashes[achievementDataHash], "Achievement hash already recorded");

        credentials[credentialId] = CredentialRecord({
            credentialId: credentialId,
            studentIdHash: studentIdHash,
            achievementTitle: achievementTitle,
            achievementDataHash: achievementDataHash,
            issuer: msg.sender,
            issuedAt: block.timestamp,
            revoked: false
        });

        registeredHashes[achievementDataHash] = true;

        emit CredentialIssued(
            credentialId,
            studentIdHash,
            achievementDataHash,
            msg.sender,
            block.timestamp
        );

        return true;
    }

    /**
     * @notice Verify whether a credential exists, matches the expected hash, and is not revoked
     */
    function verifyCredential(
        string calldata credentialId,
        bytes32 expectedHash
    ) external returns (
        bool isValid,
        string memory title,
        address issuer,
        uint256 issuedAt,
        bool isRevoked
    ) {
        CredentialRecord memory record = credentials[credentialId];
        require(record.issuedAt != 0, "Credential does not exist");

        bool matchesHash = (record.achievementDataHash == expectedHash);
        bool valid = matchesHash && !record.revoked;

        emit CredentialVerified(credentialId, valid, msg.sender, block.timestamp);

        return (
            valid,
            record.achievementTitle,
            record.issuer,
            record.issuedAt,
            record.revoked
        );
    }

    /**
     * @notice Read-only view of a credential record
     */
    function getCredential(string calldata credentialId) external view returns (CredentialRecord memory) {
        require(credentials[credentialId].issuedAt != 0, "Credential does not exist");
        return credentials[credentialId];
    }

    /**
     * @notice Revoke a credential in case of error or academic dispute
     */
    function revokeCredential(string calldata credentialId) external onlyAuthorized {
        require(credentials[credentialId].issuedAt != 0, "Credential does not exist");
        require(!credentials[credentialId].revoked, "Credential already revoked");

        credentials[credentialId].revoked = true;
        emit CredentialRevoked(credentialId, msg.sender, block.timestamp);
    }

    /**
     * @notice Check if an achievement hash has already been registered
     */
    function isHashRegistered(bytes32 dataHash) external view returns (bool) {
        return registeredHashes[dataHash];
    }
}

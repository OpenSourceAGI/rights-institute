// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AgreementRegistry
 * @dev On-chain anchor for the Prosper ledger of signed agreements.
 *
 * The rights.institute server keeps the ledger — a hash chain where each
 * block commits to the previous one — and calls anchor() for every new block.
 * Anyone can then check a certificate's block hash against this contract,
 * independently of the server's database.
 */
contract AgreementRegistry is Ownable {
    struct Anchor {
        bytes32 blockHash;
        bytes32 documentHash;
        uint64 anchoredAt;
    }

    // Ledger height => anchored block.
    mapping(uint256 => Anchor) public anchors;
    // Block hash => ledger height + 1 (0 means not anchored).
    mapping(bytes32 => uint256) private heightPlusOne;
    mapping(address => bool) public anchorers;

    event BlockAnchored(
        uint256 indexed height,
        bytes32 indexed blockHash,
        bytes32 documentHash,
        string certificateId
    );
    event AnchorerUpdated(address indexed anchorer, bool allowed);

    constructor() Ownable(msg.sender) {
        anchorers[msg.sender] = true;
    }

    function setAnchorer(address anchorer, bool allowed) external onlyOwner {
        anchorers[anchorer] = allowed;
        emit AnchorerUpdated(anchorer, allowed);
    }

    /**
     * @dev Record a ledger block. Heights are write-once, so an anchored
     * block can never be replaced.
     */
    function anchor(
        uint256 height,
        bytes32 blockHash,
        bytes32 documentHash,
        string calldata certificateId
    ) external {
        require(anchorers[msg.sender], "Not an anchorer");
        require(blockHash != bytes32(0), "Empty block hash");
        require(anchors[height].blockHash == bytes32(0), "Height already anchored");

        anchors[height] = Anchor(blockHash, documentHash, uint64(block.timestamp));
        heightPlusOne[blockHash] = height + 1;
        emit BlockAnchored(height, blockHash, documentHash, certificateId);
    }

    /// @dev Whether a block hash is anchored, and at which height.
    function lookup(bytes32 blockHash) external view returns (bool found, uint256 height) {
        uint256 h = heightPlusOne[blockHash];
        return (h != 0, h == 0 ? 0 : h - 1);
    }
}

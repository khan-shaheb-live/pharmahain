// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PharmaChain: Counterfeit Medicine Tracking System
 * @dev A smart contract for recording and tracking medicine batches across the supply chain.
 */
contract PharmaChain {
    
    // Structure to represent a medicine batch
    struct MedicineBatch {
        string batchId;
        string medicineName;
        string manufacturerName;
        address manufacturerAddress;
        address currentOwner;
        uint256 quantity;
        uint256 manufactureDate;
        uint256 expiryDate;
        uint256 createdAt;
        bool isRegistered;
    }

    // Structure to represent an ownership transfer record
    struct TransferRecord {
        address from;
        address to;
        uint256 transferDate;
        string notes;
    }

    // Mappings
    mapping(string => MedicineBatch) private batches;
    mapping(string => TransferRecord[]) private transferHistories;
    mapping(string => uint256) private scanCounts;

    // Events
    event BatchRegistered(
        string indexed batchId, 
        string medicineName, 
        address indexed manufacturer, 
        uint256 quantity
    );
    
    event OwnershipTransferred(
        string indexed batchId, 
        address indexed from, 
        address indexed to, 
        uint256 timestamp
    );
    
    event MedicineVerified(
        string indexed batchId, 
        address indexed verifier, 
        uint256 timestamp, 
        bool isGenuine,
        uint256 totalScans
    );

    // Modifiers
    modifier onlyRegisteredBatch(string memory _batchId) {
        require(batches[_batchId].isRegistered, "Error: Medicine batch not registered.");
        _;
    }

    modifier onlyBatchOwner(string memory _batchId) {
        require(batches[_batchId].currentOwner == msg.sender, "Error: Sender is not the current owner of this batch.");
        _;
    }

    /**
     * @dev Registers a new medicine batch in the blockchain.
     * @param _batchId Unique batch identifier
     * @param _medicineName Name of the medicine
     * @param _manufacturerName Name of the manufacturer company
     * @param _quantity Total quantity in this batch
     * @param _manufactureDate Timestamp of manufacture
     * @param _expiryDate Timestamp of expiry
     */
    function registerMedicineBatch(
        string memory _batchId,
        string memory _medicineName,
        string memory _manufacturerName,
        uint256 _quantity,
        uint256 _manufactureDate,
        uint256 _expiryDate
    ) public {
        require(bytes(_batchId).length > 0, "Error: Batch ID cannot be empty.");
        require(bytes(_medicineName).length > 0, "Error: Medicine name cannot be empty.");
        require(!batches[_batchId].isRegistered, "Error: Batch ID already registered.");
        require(_quantity > 0, "Error: Quantity must be greater than zero.");
        require(_expiryDate > _manufactureDate, "Error: Expiry date must be after manufacture date.");

        batches[_batchId] = MedicineBatch({
            batchId: _batchId,
            medicineName: _medicineName,
            manufacturerName: _manufacturerName,
            manufacturerAddress: msg.sender,
            currentOwner: msg.sender,
            quantity: _quantity,
            manufactureDate: _manufactureDate,
            expiryDate: _expiryDate,
            createdAt: block.timestamp,
            isRegistered: true
        });

        emit BatchRegistered(_batchId, _medicineName, msg.sender, _quantity);
    }

    /**
     * @dev Transfers ownership of a batch to a distributor or pharmacy.
     * @param _batchId Unique batch identifier
     * @param _newOwner Address of the next handler in the supply chain
     * @param _notes Optional context/notes for the transfer (e.g. "Shipped via DHL")
     */
    function transferOwnership(
        string memory _batchId,
        address _newOwner,
        string memory _notes
    ) public onlyRegisteredBatch(_batchId) onlyBatchOwner(_batchId) {
        require(_newOwner != address(0), "Error: Invalid recipient address.");
        require(_newOwner != msg.sender, "Error: Recipient cannot be current owner.");

        address previousOwner = batches[_batchId].currentOwner;
        batches[_batchId].currentOwner = _newOwner;

        transferHistories[_batchId].push(TransferRecord({
            from: previousOwner,
            to: _newOwner,
            transferDate: block.timestamp,
            notes: _notes
        }));

        emit OwnershipTransferred(_batchId, previousOwner, _newOwner, block.timestamp);
    }

    /**
     * @dev Verification endpoint. Increments verification scans and checks authenticity.
     * @param _batchId Unique batch identifier
     * @return isGenuine True if registered, false otherwise
     * @return medicineName Medicine Name
     * @return currentOwner Current owner address
     * @return totalScans Number of verification scans recorded on-chain
     */
    function verifyMedicine(string memory _batchId) 
        public 
        returns (
            bool isGenuine, 
            string memory medicineName, 
            address currentOwner, 
            uint256 totalScans
        ) 
    {
        bool genuine = batches[_batchId].isRegistered;
        uint256 scans = 0;
        
        if (genuine) {
            scanCounts[_batchId] += 1;
            scans = scanCounts[_batchId];
            
            emit MedicineVerified(
                _batchId, 
                msg.sender, 
                block.timestamp, 
                true, 
                scans
            );
            
            return (true, batches[_batchId].medicineName, batches[_batchId].currentOwner, scans);
        } else {
            emit MedicineVerified(
                _batchId, 
                msg.sender, 
                block.timestamp, 
                false, 
                0
            );
            return (false, "", address(0), 0);
        }
    }

    /**
     * @dev Retrieves full details of a registered batch.
     * @param _batchId Unique batch identifier
     */
    function getMedicineDetails(string memory _batchId)
        public
        view
        onlyRegisteredBatch(_batchId)
        returns (
            string memory batchId,
            string memory medicineName,
            string memory manufacturerName,
            address manufacturerAddress,
            address currentOwner,
            uint256 quantity,
            uint256 manufactureDate,
            uint256 expiryDate,
            uint256 createdAt,
            uint256 scansCount
        )
    {
        MedicineBatch memory batch = batches[_batchId];
        return (
            batch.batchId,
            batch.medicineName,
            batch.manufacturerName,
            batch.manufacturerAddress,
            batch.currentOwner,
            batch.quantity,
            batch.manufactureDate,
            batch.expiryDate,
            batch.createdAt,
            scanCounts[_batchId]
        );
    }

    /**
     * @dev Retrieves ownership transfer history for a batch.
     * @param _batchId Unique batch identifier
     */
    function getTransferHistory(string memory _batchId)
        public
        view
        onlyRegisteredBatch(_batchId)
        returns (TransferRecord[] memory)
    {
        return transferHistories[_batchId];
    }
}

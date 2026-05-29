module inbox3::attention_market {
    use std::string::String;
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aptos_framework::event;

    // --- Errors ---
    const E_INBOX_NOT_INITIALIZED: u64 = 1;
    const E_INBOX_ALREADY_INITIALIZED: u64 = 2;
    const E_INSUFFICIENT_STAKE: u64 = 3;
    const E_MESSAGE_NOT_FOUND: u64 = 4;
    const E_RATE_LIMITED: u64 = 5;
    const E_INVALID_PROOF: u64 = 6;

    // --- Data Structures ---

    struct Message has store {
        sender: address,
        payload_uri: String,
        timestamp: u64,
        stake: Coin<AptosCoin>,
    }

    struct Inbox has key {
        messages: vector<Message>,
        required_stake: u64,
    }

    struct MempoolCommitment has key {
        commitments: vector<vector<u8>>,
        recipients: vector<address>,
        timestamps: vector<u64>,
    }

    /// Confidential APT transfer: stores encrypted amount commitments on-chain.
    struct ConfidentialPayment has key {
        encrypted_amounts: vector<vector<u8>>,
        recipients: vector<address>,
        timestamps: vector<u64>,
    }

    /// RLN (Rate-Limiting Nullifier) state for spam prevention.
    struct RLNState has key {
        nullifier_hashes: vector<vector<u8>>,
        epoch: u64,
        message_count: u64,
    }

    struct EncryptedSubmission has drop, store {
        sender: address,
        recipient: address,
        payload_hash: vector<u8>,
        timestamp: u64,
    }

    /// A nullifier used for RLN-based spam rate limiting.
    struct NullifierRecord has drop, store {
        sender: address,
        nullifier_hash: vector<u8>,
        epoch: u64,
    }

    // --- Events ---
    #[event]
    struct MessageSentEvent has drop, store {
        sender: address,
        recipient: address,
        payload_uri: String,
        stake_amount: u64,
    }

    #[event]
    struct MessageActionedEvent has drop, store {
        recipient: address,
        sender: address,
        action: String,
        stake_amount: u64,
    }

    #[event]
    struct EncryptedCommitmentEvent has drop, store {
        sender: address,
        recipient: address,
        payload_hash: vector<u8>,
        timestamp: u64,
    }

    /// Emitted for confidential APT transfers.
    #[event]
    struct ConfidentialPaymentEvent has drop, store {
        sender: address,
        recipient: address,
        encrypted_amount: vector<u8>,
        commitment: vector<u8>,
        timestamp: u64,
    }

    /// Emitted when an RLN nullifier is submitted for rate limiting.
    #[event]
    struct NullifierSubmittedEvent has drop, store {
        sender: address,
        nullifier_hash: vector<u8>,
        epoch: u64,
    }

    // --- Core Functions ---

    public entry fun init_inbox(account: &signer, required_stake: u64) {
        let addr = std::signer::address_of(account);
        assert!(!exists<Inbox>(addr), E_INBOX_ALREADY_INITIALIZED);
        move_to(account, Inbox {
            messages: vector::empty(),
            required_stake,
        });
    }

    public entry fun send_message(
        sender: &signer,
        recipient: address,
        payload_uri: String,
        stake_amount: u64
    ) acquires Inbox {
        let sender_addr = std::signer::address_of(sender);
        assert!(exists<Inbox>(recipient), E_INBOX_NOT_INITIALIZED);
        let inbox = borrow_global_mut<Inbox>(recipient);
        assert!(stake_amount >= inbox.required_stake, E_INSUFFICIENT_STAKE);
        let stake_coin = coin::withdraw<AptosCoin>(sender, stake_amount);
        vector::push_back(&mut inbox.messages, Message {
            sender: sender_addr,
            payload_uri,
            timestamp: timestamp::now_microseconds(),
            stake: stake_coin,
        });
        event::emit(MessageSentEvent {
            sender: sender_addr,
            recipient,
            payload_uri,
            stake_amount,
        });
    }

    /// Submit a confidential APT payment with encrypted amount.
    public entry fun send_confidential_payment(
        sender: &signer,
        recipient: address,
        encrypted_amount: vector<u8>,
        commitment: vector<u8>,
        stake_amount: u64,
    ) acquires Inbox {
        let sender_addr = std::signer::address_of(sender);
        assert!(exists<Inbox>(recipient), E_INBOX_NOT_INITIALIZED);

        if (!exists<ConfidentialPayment>(sender_addr)) {
            move_to(sender, ConfidentialPayment {
                encrypted_amounts: vector::empty(),
                recipients: vector::empty(),
                timestamps: vector::empty(),
            });
        };

        let payment_store = borrow_global_mut<ConfidentialPayment>(sender_addr);
        vector::push_back(&mut payment_store.encrypted_amounts, encrypted_amount);
        vector::push_back(&mut payment_store.recipients, recipient);
        vector::push_back(&mut payment_store.timestamps, timestamp::now_microseconds());

        event::emit(ConfidentialPaymentEvent {
            sender: sender_addr,
            recipient,
            encrypted_amount,
            commitment,
            timestamp: timestamp::now_microseconds(),
        });
    }

    /// Submit an RLN nullifier to rate-limit message sending per epoch.
    public entry fun submit_nullifier(
        sender: &signer,
        nullifier_hash: vector<u8>,
        epoch: u64,
    ) acquires RLNState {
        let sender_addr = std::signer::address_of(sender);

        if (!exists<RLNState>(sender_addr)) {
            move_to(sender, RLNState {
                nullifier_hashes: vector::empty(),
                epoch,
                message_count: 0,
            });
        };

        let rln = borrow_global_mut<RLNState>(sender_addr);

        // Check if within the same epoch for rate limiting
        if (rln.epoch == epoch) {
            assert!(rln.message_count < 10, E_RATE_LIMITED); // Max 10 msgs per epoch
        } else {
            rln.epoch = epoch;
            rln.message_count = 0;
        };

        vector::push_back(&mut rln.nullifier_hashes, nullifier_hash);
        rln.message_count = rln.message_count + 1;

        event::emit(NullifierSubmittedEvent {
            sender: sender_addr,
            nullifier_hash,
            epoch,
        });
    }

    public entry fun commit_encrypted_message(
        sender: &signer,
        recipient: address,
        payload_hash: vector<u8>,
    ) {
        let sender_addr = std::signer::address_of(sender);
        let timestamp = timestamp::now_microseconds();

        if (!exists<MempoolCommitment>(sender_addr)) {
            move_to(sender, MempoolCommitment {
                commitments: vector::empty(),
                recipients: vector::empty(),
                timestamps: vector::empty(),
            });
        };

        let commitment_store = borrow_global_mut<MempoolCommitment>(sender_addr);
        vector::push_back(&mut commitment_store.commitments, payload_hash);
        vector::push_back(&mut commitment_store.recipients, recipient);
        vector::push_back(&mut commitment_store.timestamps, timestamp);

        event::emit(EncryptedCommitmentEvent {
            sender: sender_addr,
            recipient,
            payload_hash,
            timestamp,
        });
    }

    public entry fun accept_message(
        recipient: &signer,
        message_index: u64
    ) acquires Inbox {
        let addr = std::signer::address_of(recipient);
        assert!(exists<Inbox>(addr), E_INBOX_NOT_INITIALIZED);
        let inbox = borrow_global_mut<Inbox>(addr);
        assert!(message_index < vector::length(&inbox.messages), E_MESSAGE_NOT_FOUND);
        let Message { sender, payload_uri: _, timestamp: _, stake } = vector::remove(&mut inbox.messages, message_index);
        let stake_amount = coin::value(&stake);
        coin::deposit(sender, stake);
        event::emit(MessageActionedEvent {
            recipient: addr,
            sender,
            action: std::string::utf8(b"accepted"),
            stake_amount,
        });
    }

    public entry fun report_spam(
        recipient: &signer,
        message_index: u64
    ) acquires Inbox {
        let addr = std::signer::address_of(recipient);
        assert!(exists<Inbox>(addr), E_INBOX_NOT_INITIALIZED);
        let inbox = borrow_global_mut<Inbox>(addr);
        assert!(message_index < vector::length(&inbox.messages), E_MESSAGE_NOT_FOUND);
        let Message { sender, payload_uri: _, timestamp: _, stake } = vector::remove(&mut inbox.messages, message_index);
        let stake_amount = coin::value(&stake);
        coin::deposit(addr, stake);
        event::emit(MessageActionedEvent {
            recipient: addr,
            sender,
            action: std::string::utf8(b"spam"),
            stake_amount,
        });
    }

    public entry fun update_required_stake(
        account: &signer,
        new_stake: u64
    ) acquires Inbox {
        let addr = std::signer::address_of(account);
        assert!(exists<Inbox>(addr), E_INBOX_NOT_INITIALIZED);
        let inbox = borrow_global_mut<Inbox>(addr);
        inbox.required_stake = new_stake;
    }

    // --- View Functions ---

    #[view]
    public fun has_mempool_commitments(sender: address): bool acquires MempoolCommitment {
        if (!exists<MempoolCommitment>(sender)) return false;
        let store = borrow_global<MempoolCommitment>(sender);
        vector::length(&store.commitments) > 0
    }

    #[view]
    public fun get_mempool_commitment_count(sender: address): u64 acquires MempoolCommitment {
        if (!exists<MempoolCommitment>(sender)) return 0;
        let store = borrow_global<MempoolCommitment>(sender);
        vector::length(&store.commitments)
    }

    #[view]
    public fun get_rln_message_count(account: address): u64 acquires RLNState {
        if (!exists<RLNState>(account)) return 0;
        let rln = borrow_global<RLNState>(account);
        rln.message_count
    }

    // --- Tests ---
    #[test_only]
    use aptos_framework::aptos_coin;
    #[test_only]
    use std::string;

    #[test(aptos_framework = @0x1, sender = @0x123, recipient = @0x456)]
    public fun test_attention_market_flow(
        aptos_framework: &signer,
        sender: &signer,
        recipient: &signer
    ) acquires Inbox {
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);
        let sender_addr = std::signer::address_of(sender);
        let recipient_addr = std::signer::address_of(recipient);
        account::create_account_for_test(sender_addr);
        account::create_account_for_test(recipient_addr);
        coin::register<AptosCoin>(sender);
        coin::register<AptosCoin>(recipient);
        coin::deposit(sender_addr, coin::mint(1000, &mint_cap));
        init_inbox(recipient, 100);
        send_message(sender, recipient_addr, string::utf8(b"ipfs://payload"), 100);
        assert!(coin::balance<AptosCoin>(sender_addr) == 900, 1);
        accept_message(recipient, 0);
        assert!(coin::balance<AptosCoin>(sender_addr) == 1000, 2);
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }

    #[test(sender = @0x123, recipient = @0x456)]
    public fun test_encrypted_commitment(
        sender: &signer,
        recipient: &signer,
    ) acquires MempoolCommitment {
        let sender_addr = std::signer::address_of(sender);
        let recipient_addr = std::signer::address_of(recipient);
        commit_encrypted_message(sender, recipient_addr, b"hash_1");
        assert!(has_mempool_commitments(sender_addr), 1);
        assert!(get_mempool_commitment_count(sender_addr) == 1, 2);
        commit_encrypted_message(sender, recipient_addr, b"hash_2");
        assert!(get_mempool_commitment_count(sender_addr) == 2, 3);
    }

    #[test(sender = @0x123)]
    public fun test_rln_nullifier_submission(
        sender: &signer,
    ) acquires RLNState {
        let sender_addr = std::signer::address_of(sender);
        submit_nullifier(sender, b"nullifier_1", 1);
        assert!(get_rln_message_count(sender_addr) == 1, 1);
        submit_nullifier(sender, b"nullifier_2", 1);
        assert!(get_rln_message_count(sender_addr) == 2, 2);
    }
}

module inbox3_addr::inbox3 {
    use std::signer;
    use std::vector;
    use aptos_framework::event;

    struct Inbox has key {
        message_count: u64,
        public_key: vector<u8>,
        initialized: bool,
    }

    struct Escrow has key {
        pending_messages: vector<vector<u8>>,
        pending_senders: vector<address>,
        pending_timestamps: vector<u64>,
    }

    struct MessageSentEvent has drop, store {
        sender: address,
        recipient: address,
        message_hash: vector<u8>,
        timestamp: u64,
        is_escrow: bool,
    }

    struct InboxInitializedEvent has drop, store {
        account: address,
        public_key: vector<u8>,
        timestamp: u64,
    }

    struct MessageStore has key {
        messages: vector<vector<u8>>,
        senders: vector<address>,
        timestamps: vector<u64>,
    }

    public entry fun initialize_inbox(
        account: &signer,
        public_key: vector<u8>,
    ) {
        let addr = signer::address_of(account);
        assert!(!exists<Inbox>(addr), 101);

        move_to(account, Inbox {
            message_count: 0,
            public_key,
            initialized: true,
        });
        move_to(account, MessageStore {
            messages: vector::empty(),
            senders: vector::empty(),
            timestamps: vector::empty(),
        });

        event::emit(InboxInitializedEvent {
            account: addr,
            public_key,
            timestamp: std::timestamp::now_microseconds(),
        });
    }

    public entry fun send_message(
        sender: &signer,
        recipient: address,
        encrypted_payload: vector<u8>,
    ) {
        let sender_addr = signer::address_of(sender);
        let timestamp = std::timestamp::now_microseconds();

        if (exists<Inbox>(recipient)) {
            let inbox = borrow_global_mut<Inbox>(recipient);
            inbox.message_count = inbox.message_count + 1;

            if (exists<MessageStore>(recipient)) {
                let store = borrow_global_mut<MessageStore>(recipient);
                vector::push_back(&mut store.messages, encrypted_payload);
                vector::push_back(&mut store.senders, sender_addr);
                vector::push_back(&mut store.timestamps, timestamp);
            }

            event::emit(MessageSentEvent {
                sender: sender_addr,
                recipient,
                message_hash: encrypted_payload,
                timestamp,
                is_escrow: false,
            });
        } else {
            if (!exists<Escrow>(recipient)) {
                move_to(&signer::new_from_address(recipient), Escrow {
                    pending_messages: vector::empty(),
                    pending_senders: vector::empty(),
                    pending_timestamps: vector::empty(),
                });
            }

            let escrow = borrow_global_mut<Escrow>(recipient);
            vector::push_back(&mut escrow.pending_messages, encrypted_payload);
            vector::push_back(&mut escrow.pending_senders, sender_addr);
            vector::push_back(&mut escrow.pending_timestamps, timestamp);

            event::emit(MessageSentEvent {
                sender: sender_addr,
                recipient,
                message_hash: encrypted_payload,
                timestamp,
                is_escrow: true,
            });
        }
    }

    public entry fun claim_escrow_messages(account: &signer, public_key: vector<u8>) {
        let addr = signer::address_of(account);
        assert!(exists<Escrow>(addr), 301);

        if (!exists<Inbox>(addr)) {
            move_to(account, Inbox {
                message_count: 0,
                public_key,
                initialized: true,
            });
            move_to(account, MessageStore {
                messages: vector::empty(),
                senders: vector::empty(),
                timestamps: vector::empty(),
            });
        }

        let escrow = borrow_global_mut<Escrow>(addr);
        let store = borrow_global_mut<MessageStore>(addr);
        let inbox = borrow_global_mut<Inbox>(addr);

        let count = vector::length(&escrow.pending_messages);
        let mut i = 0;
        while (i < count) {
            let msg = vector::remove(&mut escrow.pending_messages, 0);
            let sender = vector::remove(&mut escrow.pending_senders, 0);
            let ts = vector::remove(&mut escrow.pending_timestamps, 0);

            vector::push_back(&mut store.messages, msg);
            vector::push_back(&mut store.senders, sender);
            vector::push_back(&mut store.timestamps, ts);
            inbox.message_count = inbox.message_count + 1;

            i = i + 1;
        };
    }

    public fun is_inbox_initialized(account: address): bool {
        exists<Inbox>(account)
    }

    public fun has_escrow(account: address): bool acquires Escrow {
        if (!exists<Escrow>(account)) return false;
        let escrow = borrow_global<Escrow>(account);
        vector::length(&escrow.pending_messages) > 0
    }

    public fun get_escrow_count(account: address): u64 acquires Escrow {
        if (!exists<Escrow>(account)) return 0;
        let escrow = borrow_global<Escrow>(account);
        vector::length(&escrow.pending_messages)
    }

    public fun get_message_count(account: address): u64 acquires Inbox {
        assert!(exists<Inbox>(account), 401);
        borrow_global<Inbox>(account).message_count
    }

    public fun get_public_key(account: address): &vector<u8> acquires Inbox {
        assert!(exists<Inbox>(account), 501);
        &borrow_global<Inbox>(account).public_key
    }

    public fun get_messages(account: address): &vector<vector<u8>> acquires MessageStore {
        assert!(exists<MessageStore>(account), 601);
        &borrow_global<MessageStore>(account).messages
    }

    public fun get_message_senders(account: address): &vector<address> acquires MessageStore {
        assert!(exists<MessageStore>(account), 701);
        &borrow_global<MessageStore>(account).senders
    }

    public entry fun delete_message(account: &signer, index: u64) acquires MessageStore {
        let addr = signer::address_of(account);
        assert!(exists<MessageStore>(addr), 801);
        let store = borrow_global_mut<MessageStore>(addr);
        assert!(index < vector::length(&store.messages), 802);
        vector::remove(&mut store.messages, index);
        vector::remove(&mut store.senders, index);
        vector::remove(&mut store.timestamps, index);
    }

    #[test]
    fun test_initialize_and_send() {
        use aptos_framework::account;

        let (sender, sender_addr) = account::create_account_for_test(100000000);
        let (recipient, recipient_addr) = account::create_account_for_test(100000000);

        initialize_inbox(&recipient, b"test_public_key");
        assert!(get_message_count(recipient_addr) == 0, 1);
        assert!(is_inbox_initialized(recipient_addr), 2);

        send_message(&sender, recipient_addr, b"encrypted_message");
        assert!(get_message_count(recipient_addr) == 1, 3);
    }

    #[test]
    fun test_send_to_uninitialized_creates_escrow() {
        use aptos_framework::account;

        let (sender, _) = account::create_account_for_test(100000000);
        let (_, recipient_addr) = account::create_account_for_test(100000000);

        assert!(!is_inbox_initialized(recipient_addr), 1);
        send_message(&sender, recipient_addr, b"escrow_message");
        assert!(has_escrow(recipient_addr), 2);
        assert!(get_escrow_count(recipient_addr) == 1, 3);
    }

    #[test]
    fun test_claim_escrow() {
        use aptos_framework::account;

        let (sender, _) = account::create_account_for_test(100000000);
        let (recipient, recipient_addr) = account::create_account_for_test(100000000);

        send_message(&sender, recipient_addr, b"escrow_msg_1");
        send_message(&sender, recipient_addr, b"escrow_msg_2");

        assert!(has_escrow(recipient_addr), 1);
        assert!(get_escrow_count(recipient_addr) == 2, 2);

        initialize_inbox(&recipient, b"recipient_pub_key");
        claim_escrow_messages(&recipient, b"recipient_pub_key");

        assert!(!has_escrow(recipient_addr), 3);
        assert!(get_message_count(recipient_addr) == 2, 4);
    }

    #[test]
    fun test_delete_message() {
        use aptos_framework::account;

        let (sender, sender_addr) = account::create_account_for_test(100000000);
        let (recipient, recipient_addr) = account::create_account_for_test(100000000);

        initialize_inbox(&recipient, b"pub_key");
        send_message(&sender, recipient_addr, b"msg1");
        send_message(&sender, recipient_addr, b"msg2");

        delete_message(&recipient, 0);
        assert!(get_message_count(recipient_addr) == 2, 1);
    }

    #[test]
    fun test_get_public_key() {
        use aptos_framework::account;

        let (_, recipient_addr) = account::create_account_for_test(100000000);
        let (recipient, _) = account::create_account_for_test(100000000);

        initialize_inbox(&recipient, b"my_public_key_data");
        let pub_key = get_public_key(recipient_addr);
        assert!(vector::length(pub_key) == 17, 1);
    }
}

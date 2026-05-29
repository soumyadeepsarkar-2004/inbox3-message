module inbox3_addr::inbox3 {
    use std::signer;
    use std::vector;
    use aptos_framework::event;

    struct Inbox has key {
        message_count: u64,
        public_key: vector<u8>,
        initialized: bool,
    }

    struct MessageSentEvent has drop, store {
        sender: address,
        recipient: address,
        message_hash: vector<u8>,
        timestamp: u64,
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

        assert!(exists<Inbox>(recipient), 201);
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
        });
    }

    public fun is_inbox_initialized(account: address): bool {
        exists<Inbox>(account)
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

        let sender = account::create_account_for_test(@0xAA);
        let sender_addr = @0xAA;
        let recipient = account::create_account_for_test(@0xBB);
        let recipient_addr = @0xBB;

        initialize_inbox(&recipient, b"test_public_key");
        assert!(get_message_count(recipient_addr) == 0, 1);
        assert!(is_inbox_initialized(recipient_addr), 2);

        send_message(&sender, recipient_addr, b"encrypted_message");
        assert!(get_message_count(recipient_addr) == 1, 3);
    }

    #[test]
    fun test_delete_message() {
        use aptos_framework::account;

        let sender = account::create_account_for_test(@0xCC);
        let recipient = account::create_account_for_test(@0xDD);
        let recipient_addr = @0xDD;

        initialize_inbox(&recipient, b"pub_key");
        send_message(&sender, recipient_addr, b"msg1");
        send_message(&sender, recipient_addr, b"msg2");

        delete_message(&recipient, 0);
        assert!(get_message_count(recipient_addr) == 2, 1);
    }

    #[test]
    fun test_get_public_key() {
        use aptos_framework::account;

        let recipient = account::create_account_for_test(@0xEE);
        let recipient_addr = @0xEE;

        initialize_inbox(&recipient, b"my_public_key_data");
        let pub_key = get_public_key(recipient_addr);
        assert!(vector::length(pub_key) == 17, 1);
    }
}

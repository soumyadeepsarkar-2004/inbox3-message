module inbox3_addr::inbox3 {
    use std::string;
    use std::signer;
    use aptos_framework::event;

    struct Inbox has key {
        messages: u64,
    }

    struct MessageSentEvent has drop, store {
        sender: address,
        recipient: address,
        message_hash: vector<u8>,
        timestamp: u64,
    }

    struct MessageStore has key {
        messages: vector<vector<u8>>,
    }

    public entry fun initialize_inbox(account: &signer) {
        let addr = signer::address_of(account);
        assert!(!exists<Inbox>(addr), 101);
        move_to(account, Inbox { messages: 0 });
        move_to(account, MessageStore { messages: vector::empty() });
    }

    public entry fun send_message(
        sender: &signer,
        recipient: address,
        encrypted_payload: vector<u8>,
    ) {
        let sender_addr = signer::address_of(sender);
        assert!(exists<Inbox>(recipient), 201);

        let message_hash = encrypted_payload;
        let timestamp = std::timestamp::now_microseconds();

        event::emit(MessageSentEvent {
            sender: sender_addr,
            recipient,
            message_hash,
            timestamp,
        });

        if (exists<MessageStore>(recipient)) {
            let store = borrow_global_mut<MessageStore>(recipient);
            vector::push_back(&mut store.messages, encrypted_payload);
        }

        let inbox = borrow_global_mut<Inbox>(recipient);
        inbox.messages = inbox.messages + 1;
    }

    public fun get_message_count(account: address): u64 acquires Inbox {
        assert!(exists<Inbox>(account), 301);
        borrow_global<Inbox>(account).messages
    }

    public fun get_messages(account: address): &vector<vector<u8>> acquires MessageStore {
        assert!(exists<MessageStore>(account), 401);
        &borrow_global<MessageStore>(account).messages
    }

    public entry fun delete_message(account: &signer, index: u64) acquires MessageStore {
        let addr = signer::address_of(account);
        assert!(exists<MessageStore>(addr), 501);
        let store = borrow_global_mut<MessageStore>(addr);
        assert!(index < vector::length(&store.messages), 502);
        vector::remove(&mut store.messages, index);
    }

    #[test]
    fun test_initialize_and_send() {
        use aptos_framework::account;

        let (sender, sender_addr) = account::create_account_for_test(100000000);
        let (recipient, recipient_addr) = account::create_account_for_test(100000000);

        initialize_inbox(&recipient);
        assert!(get_message_count(recipient_addr) == 0, 1);

        send_message(&sender, recipient_addr, b"encrypted_message");
        assert!(get_message_count(recipient_addr) == 1, 2);
    }

    #[test]
    fun test_send_to_uninitialized_fails() {
        use aptos_framework::account;

        let (sender, _) = account::create_account_for_test(100000000);
        let (_, recipient_addr) = account::create_account_for_test(100000000);

        send_message(&sender, recipient_addr, b"test");
    }

    #[test]
    fun test_delete_message() {
        use aptos_framework::account;

        let (sender, sender_addr) = account::create_account_for_test(100000000);
        let (recipient, recipient_addr) = account::create_account_for_test(100000000);

        initialize_inbox(&recipient);
        send_message(&sender, recipient_addr, b"msg1");
        send_message(&sender, recipient_addr, b"msg2");

        delete_message(&recipient, 0);
        assert!(get_message_count(recipient_addr) == 2, 1);
    }
}

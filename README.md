// SimpleContract.tz

parameter unit;
storage int;
code { DROP; PUSH int 42; NIL operation; PAIR; }






parameter (or (or (nat %store) (unit %reset)) (unit %get));
storage int;
code {
    UNPAIR;
    IF_LEFT {
        IF_LEFT {
            DROP;  # Drop the 'reset' option
            PUSH int 0;  # Reset the storage to 0
        } {
            # 'store' option
            DUP;  # Duplicate the value on top of the stack
            DIP { SWAP };  # Swap the storage and the value
            # Add the value to the storage
            ADD;
        }
    } {
        DROP;  # Drop the 'get' option
    };
    # Pair the storage and an empty operation list
    PAIR;
};

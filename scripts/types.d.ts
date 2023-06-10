interface Contract {
    address: string;
    constructor: any[];
}

export interface Deployment {
    network: string;
    deployer: string;
    senderFactory: Contract;
    entryPoint: Contract;
    simpleAccountFactory: Contract;
    paymasterFactory: Contract;
    paymaster: Contract;
}

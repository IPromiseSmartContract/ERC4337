# ERC4337 Account Abstraction

## Development Guide (VSCode)

1. Install plugins

   - `Prettier`
   - `Solidity`
   - `Tools for solidity`

2. Execute the following commands:

   ```shell
   yarn && npx hardhat compile
   ```

3. Copy `.env.example` to `.env` and **fill in the values**

   ```shell
    cp .env.example .env
   ```

## Deploy to Sepolia

```shell
npx hardhat run scripts/deploy.ts --network sepolia
```

## Deploy to localhost

on one terminal

```shell
npx hardhat node
```

on another terminal

```shell

npx hardhat run scripts/deploy.ts --network localhost
```

## Verify

verify sender factory

```shell
npx hardhat verify --network sepolia <deploy address>
```

verify entrypoint

```shell
npx hardhat verify --network sepolia <deploy address> <senderFactory address>
```

## Deployment

Deployer | 0xD3b816bACeaF39A4A7262DC4B6357023ad15aea6

SenderFactory | [0xbf38564FA8692795a64991B9FB6e1358dF8c4837](https://sepolia.etherscan.io/address/0xbf38564FA8692795a64991B9FB6e1358dF8c4837#code)

EntryPoint | [0x9FA609A4430218a20aF170e246c1E35fbaCc3485](https://sepolia.etherscan.io/address/0x9FA609A4430218a20aF170e246c1E35fbaCc3485#code)

SimpleAccountFactory | [0xE334Ac1DD0e0f89c2B1e45a9a4cA42EC00b57067](https://sepolia.etherscan.io/address/0xE334Ac1DD0e0f89c2B1e45a9a4cA42EC00b57067#code)

PaymasterFactory | [0x175A72d1768190277d96411Fc926206689D2ca0d](https://sepolia.etherscan.io/address/0x175A72d1768190277d96411Fc926206689D2ca0d#code)

Paymaster (Test)| [0x7626BE17071b0656f4F52eA3D0A2696De6019a72](https://sepolia.etherscan.io/address/0x7626BE17071b0656f4F52eA3D0A2696De6019a72#code)

# ERC4337 Account Abstraction

## Development Guide (VSCode)

1. Install plugins

   - `Prettier`
   - `Solidity`
   - `Tools for solidity`

2. Execute the following commands:

   ```shell
   yarn 
   yarn compile
   ```

3. Copy `.env.example` to `.env` and **fill in the values**

   ```shell
   cp .env.example .env
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

## Deploy to Sepolia

```shell
yarn deploy
```

After deployment, a json file will be generated in `deployments/` folder.

## Verify

```shell
yarn verify
```

It will pop up a prompt, require user to input the json file path in `deployments/` folder

## Test

```shell
yarn test
```

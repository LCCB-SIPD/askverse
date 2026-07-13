#!/bin/bash
# Fee estimation script for AskVerse's Soroban contract (TESTNET)

WASM="target/wasm32v1-none/release/askverse_gifts.wasm"

XDR=$(stellar contract upload --wasm "$WASM" --source testnet-deployer --network testnet --build-only 2>/dev/null)

BODY=$(jq -n --arg xdr "$XDR" '{jsonrpc: "2.0", id: 1, method: "simulateTransaction", params: {transaction: $xdr}}')

RESP=$(curl -s -X POST https://soroban-testnet.stellar.org \
  -H "Content-Type: application/json" \
  -d "$BODY")

FEE_STROOPS=$(echo "$RESP" | jq -r '.result.minResourceFee')
FEE_XLM=$(echo "scale=7; $FEE_STROOPS / 10000000" | bc)

echo "askverse_gifts (testnet) : $FEE_STROOPS stroops = $FEE_XLM XLM"
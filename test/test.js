const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
const keccak256 = require("keccak256");
const SHA256 = require("crypto-js/sha256");

// Pass command-line arguments:
// 1. private key of sender
// 2. address of recipient
// 3. amount to send
// Returns JSON stringified signature for the transaction

const key = ec.keyFromPrivate(process.argv[2]);
const recipAddress = process.argv[3];
const amount = process.argv[4];

const msg = JSON.stringify({ to: recipAddress, amount: amount });
console.log("Message: ", msg);

const msgHash = SHA256(msg).toString();
console.log("Message Hash: ", msgHash);

const signature = key.sign(msgHash);
console.log(
  JSON.stringify({
    r: signature.r.toString(16),
    s: signature.s.toString(16),
  })
);

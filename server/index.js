const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
const keccak256 = require("keccak256");
const SHA256 = require("crypto-js/sha256");

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

// Generate public keys
const NUM_KEYS = 3;
let keyLookup = {};
let balances = {};
for (let i = 0; i < NUM_KEYS; i++) {
  const key = ec.genKeyPair();
  const publicKey = key.getPublic().encode("hex");
  let keyPair = {
    privateKey: key.getPrivate().toString(16),
    publicKey: publicKey,
    address: `0x${keccak256(publicKey).toString("hex").slice(0, 40)}`,
  };
  keyLookup[keyPair.address] = key;
  balances[keyPair.address] = 100;
  console.log(keyPair);
}

console.log("Balances: ", balances);

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, txSignature } = req.body;

  // Verify signature
  try {
    // Generate transaction signature
    const msg = JSON.stringify({ to: recipient, amount: amount });
    console.log("Message: ", msg);
    const msgHash = SHA256(msg).toString();
    console.log("Message Hash: ", msgHash);

    // Verify user-provided txSignature
    const key = keyLookup[sender];
    console.log(JSON.parse(txSignature));

    if (key.verify(msgHash, JSON.parse(txSignature))) {
      console.log("Validated Transaction");
      balances[sender] -= amount;
      balances[recipient] = (balances[recipient] || 0) + +amount;
      res.send({ balance: balances[sender] });
    } else {
      console.log("Invalid Signature");
    }
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

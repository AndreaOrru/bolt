require("dotenv").config();

const Web3 = require("web3");
const web3 = new Web3(
  `wss://mainnet.infura.io/ws/v3/${process.env.PROJECT_ID}`
);

const subscription = web3.eth
  .subscribe("pendingTransactions", (error, result) => {
    if (!error) console.log(result);
  })
  .on("data", (transaction) => {
    console.log(transaction);
  });

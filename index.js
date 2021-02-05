require("dotenv").config();

const WebSocket = require("ws");
const ws = new WebSocket(process.env.WS_SERVER);

const simdjson = require("simdjson");
const _ = require("underscore");

let pendingTransactions = {};

ws.on("open", () => {
  ws.send(
    JSON.stringify({
      method: "parity_subscribe",
      params: ["parity_pendingTransactions", []],
      id: 1,
      jsonrpc: "2.0",
    })
  );

  ws.send(
    JSON.stringify({
      method: "eth_subscribe",
      params: ["newHeads"],
      id: 2,
      jsonrpc: "2.0",
    })
  );
});

ws.on("message", (data) => {
  const json = simdjson.parse(data);

  if (json["method"] == "parity_subscription") {
    const transactions = json["params"]["result"];
    transactions.forEach((transaction) => {
      if (transaction["to"] === process.env.TARGET_ADDRESS) {
        if (!(transaction["hash"] in pendingTransactions)) {
          pendingTransactions[transaction["hash"]] = transaction;
          console.log(transaction);
        }
      }
    });
  } else if (json["method"] == "eth_subscription") {
    pendingTransactions = {};
  }
});

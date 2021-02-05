require("dotenv").config();

const WebSocket = require("ws");
const ws = new WebSocket(process.env.WS_SERVER);

const simdjson = require("simdjson");
const _ = require("underscore");

let currentTransactions = {};

ws.on("open", () => {
  ws.send(
    JSON.stringify({
      method: "parity_subscribe",
      params: ["parity_pendingTransactions", []],
      id: 1,
      jsonrpc: "2.0",
    })
  );
});

ws.on("message", (data) => {
  let seenTransactions = new Set();

  const json = simdjson.parse(data);
  if (json["method"] != "parity_subscription") return;

  const transactions = json["params"]["result"];
  transactions.forEach((transaction) => {
    if (transaction["to"] === process.env.TARGET_ADDRESS) {
      if (!(transaction["hash"] in currentTransactions)) {
        currentTransactions[transaction["hash"]] = transaction;
        console.log(transaction);
      }
      seenTransactions.add(transaction["hash"]);
    }
  });

  currentTransactions = _.omit(currentTransactions, (value, key, object) => {
    const resolved = !(key in seenTransactions);
    if (resolved) {
      console.log(`${key} RESOLVED`);
    }
    return resolved;
  });
});

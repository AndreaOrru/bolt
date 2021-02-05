require("dotenv").config();

const WebSocket = require("ws");
const ws = new WebSocket(process.env.WS_SERVER);

const simdjson = require('simdjson');

function subscribeToPendingTransactions() {
  ws.send(
    JSON.stringify({
      method: "parity_subscribe",
      params: ["parity_pendingTransactions", []],
      id: 1,
      jsonrpc: "2.0",
    })
  );
}

ws.on("open", () => {
  subscribeToPendingTransactions();
});

ws.on("message", (data) => {
    const json = simdjson.parse(data);
    if (json["method"] != 'parity_subscription') return;

    const transactions = json["params"]["result"];
    transactions.forEach(transaction => {
        if (transaction["to"] == process.env.TARGET_ADDRESS) {
            console.log(transaction);
        }
    });
});

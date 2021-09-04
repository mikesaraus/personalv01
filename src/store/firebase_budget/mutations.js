import { reactive } from "vue";

function addUnshiftTransactions(state, payload) {
  state.transactions.unshift(payload);
}

function addPushTransactions(state, payload) {
  state.transactions.push(payload);
}

function removeTransaction(state, payload) {
  let index = state.transactions.findIndex(
    (transaction) => transaction.id == payload.id
  );
  state.transactions.splice(index, 1);
}

function updateTransaction(state, payload) {
  let index = state.transactions.findIndex(
    (transaction) => transaction.id == payload.id
  );
  Object.assign(state.transactions[index], payload);
}

function clearTransactions(state) {
  state.transactions = reactive([]);
}

export {
  addUnshiftTransactions,
  addPushTransactions,
  updateTransaction,
  removeTransaction,
  clearTransactions,
};

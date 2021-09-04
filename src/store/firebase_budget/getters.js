function walletBalance(state, getters) {
  return getters.transactionsDebit.sum - getters.transactionsCredit.sum;
}

function transactionsDebit(state) {
  let sum = 0;
  const filtered = state.transactions.filter((e) => e.type === "debit");
  filtered.forEach((e) => {
    sum += e.money;
  });
  return { sum: sum, data: filtered };
}

function transactionsCredit(state) {
  let sum = 0;
  const filtered = state.transactions.filter((e) => e.type === "credit");
  filtered.forEach((e) => {
    sum += e.money;
  });
  return { sum: sum, data: filtered };
}

export { walletBalance, transactionsDebit, transactionsCredit };

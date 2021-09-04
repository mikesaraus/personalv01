function groupedMessages(state) {
  let lastSender = null,
    cnt = -1,
    messagesFiltered = [];
  Object.keys(state.messages).forEach((key, i) => {
    const msg = state.messages[key];
    if (msg.from == lastSender) {
      messagesFiltered[cnt].push({
        id: key,
        data: msg,
      });
      if (msg.text.length >= 50) messagesFiltered[cnt][0].size = "8";
    } else {
      cnt++;
      lastSender = msg.from;
      const size = msg.text.length >= 50 ? "8" : "";
      messagesFiltered.push([{ id: key, data: msg, size: size }]);
    }
  });
  return messagesFiltered;
}

export { groupedMessages };

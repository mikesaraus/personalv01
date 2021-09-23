import { collections } from "../firebase_config";

function notifMessages(state) {
  const type = collections.notifications.messages;
  if (state.notifications && state.notifications[type])
    return state.notifications[type];
  return [];
}

export { notifMessages };

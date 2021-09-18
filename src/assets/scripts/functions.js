import { Buffer } from "buffer";
import { Notify } from "quasar";

// Base64 Function
function base64_encode(text) {
  try {
    return Buffer.from(text, "utf-8").toString("base64");
  } catch (e) {
    console.error("Base64 Encode: ", e.message);
  }
}

function base64_decode(base64) {
  try {
    return Buffer.from(base64, "base64").toString("utf-8");
  } catch (e) {
    console.error("Base64 Decode: ", e.message);
  }
}

const base64 = {
  encode: base64_encode,
  decode: base64_decode,
};
// End of Base64

function customAlert(
  message,
  type,
  timeout = 1000,
  position = null,
  moreOptions = {}
) {
  let config = {
    message: message,
    timeout: timeout,
    progress: true,
  };
  if (type) config.type = type;
  if (position) config.position = position;
  if (moreOptions) {
    if (Object.keys(moreOptions).length) {
      Object.keys(moreOptions).forEach((key) => {
        config[key] = moreOptions[key];
      });
    }
  }
  Notify.create(config);
}

// Checker Function
function checkIfObject(obj) {
  return Object.prototype.toString.call(obj) === "[object Object]";
}

const check = {
  type: {
    isObject: checkIfObject,
  },
};
// End of Checker

export { base64, check, customAlert };

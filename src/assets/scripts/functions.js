import { Buffer } from "buffer";
import { Notify } from "quasar";
import { myvar } from "src/boot/firebase";

// Greetings
function greetings_console() {
  console.log(
    "%c" + myvar.default.message,
    "color: grey; font-family:system-ui; font-size: 3rem; font-weight: bold"
  );
  console.log(
    "%c" + myvar.default.bug,
    "color: silver; font-size: 1.5em; text-weight: bold;"
  );
}

const greetings = {
  console: greetings_console,
};
// End Greetings

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
    progress: true,
    message: message,
    timeout: timeout ? timeout : 1000,
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

function inputValidate(toResolve, timeout = 1000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (checkIfObject(toResolve)) {
        if (toResolve.type && toResolve.value) {
          switch (toResolve.type.toLowerCase()) {
            case "email":
              resolve(
                regexp.email.test(String(toResolve.value).toLowerCase()) ||
                  "Invalid Email Address"
              );
              break;

            case "password":
              resolve(
                regexp.password.test(String(toResolve.value).toLowerCase()) ||
                  "Password is Weak"
              );
              break;

            default:
              resolve(false, "");
              break;
          }
        } else {
          resolve(false, "");
        }
      }
      resolve(toResolve);
    }, timeout);
  });
}

const check = {
  type: {
    isObject: checkIfObject,
  },
  input: inputValidate,
};
// End of Checker

// Regular Expressions
const regexp = {
  email:
    /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/,
  password:
    /^((?=(.*\d){1,})(?=(.*[!@#$%^&*()\-__+.]){1,})(?=(.*[a-zA-Z]){3,})).{9,}$/,
};
// End of Regular Expressions

function addLinkHtml(inputText) {
  let replacedText;
  // Remove Tags
  replacedText = inputText.replace(/</gim, "&lt;");
  //URLs starting with http://, https://, or ftp://
  const replacePattern1 =
    /(\b(https?|ftps?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
  replacedText = replacedText.replace(
    replacePattern1,
    '<a href="$1" target="_blank">$1</a>'
  );
  //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
  const replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
  replacedText = replacedText.replace(
    replacePattern2,
    '$1<a href="http://$2" target="_blank">$2</a>'
  );
  return replacedText;
}

export { greetings, base64, check, regexp, customAlert, addLinkHtml };

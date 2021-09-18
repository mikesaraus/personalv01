import { boot } from "quasar/wrappers";
import * as openpgp from "openpgp";

async function generate(
  payload = {
    passphrase: null,
    userIds: null,
    type: "ecc",
    curve: "ed25519",
    format: "armored",
  }
) {
  let result = {};
  try {
    await openpgp
      .generateKey({
        type: payload.type, // Type of the key, defaults to ECC
        userIDs: payload.userIds, // [{}] array of objects - you can pass multiple user IDs
        curve: payload.curve, // ECC curve name, defaults to curve25519
        passphrase: payload.passphrase, // protects the private key
        format: payload.format, // output key format, defaults to 'armored' (other options: 'binary' or 'object')
      })
      .then((response) => {
        result = { success: true, response: response };
      })
      .catch((error) => {
        result = { success: false, response: error };
      });
  } catch (error) {
    result = { success: false, response: error };
  }
  return result;
}

async function encrypt_string(
  payload = {
    publicKeysArmored: null,
    privateKeyArmored: null,
    passphrase: null,
    plainText: null,
  }
) {
  let result = {};
  try {
    const publicKeys = await Promise.all(
      payload.publicKeysArmored.map((armoredKey) =>
        openpgp.readKey({ armoredKey })
      )
    );
    const privateKey = payload.privateKeyArmored
      ? await openpgp.decryptKey({
          privateKey: await openpgp.readPrivateKey({
            armoredKey: payload.privateKeyArmored,
          }),
          passphrase: payload.passphrase,
        })
      : null;
    let options = {
      message: await openpgp.createMessage({ text: payload.plainText }), // input as Message object
      encryptionKeys: publicKeys,
    };
    if (privateKey) options.signingKeys = privateKey; // optional
    const encrypted = await openpgp.encrypt(options);
    result = { success: true, response: encrypted };
  } catch (error) {
    result = { success: false, response: error };
  }
  return result;
}

async function decrypt_string(
  payload = {
    privateKeyArmored: null,
    publicKeyArmored: null,
    passphrase: null,
    encryptedText: null,
  }
) {
  let result = {};
  try {
    const publicKey = payload.publicKeyArmored
      ? await openpgp.readKey({
          armoredKey: payload.publicKeyArmored,
        })
      : null;
    const privateKey = await openpgp.decryptKey({
      privateKey: await openpgp.readPrivateKey({
        armoredKey: payload.privateKeyArmored,
      }),
      passphrase: payload.passphrase,
    });
    const message = await openpgp.readMessage({
      armoredMessage: payload.encryptedText, // parse armored message
    });
    let options = {
      message,
      decryptionKeys: privateKey,
    };
    if (publicKey) {
      options.verificationKeys = publicKey;
      options.expectSigned = true;
    } // optional
    const { data: decrypted, signatures } = await openpgp.decrypt(options);
    // check signature validity (signed messages only)
    try {
      if (payload.publicKeyArmored) await signatures[0].verified; // throws on invalid signature
      result = { success: true, response: decrypted };
    } catch (error) {
      result = { success: false, response: error };
    }
  } catch (e) {
    result = { success: false, response: error };
  }
  return result;
}

const openpgp_methods = {
  generate,
  encrypt_string,
  decrypt_string,
};

export default boot(({ app }) => {
  app.config.globalProperties.$openpgp = openpgp;
  app.config.globalProperties.$openpgp_methods = openpgp_methods;
});

export { openpgp, openpgp_methods };

import fs from "fs";
import https from "https";
import fetch from "node-fetch";

main().then();

async function main() {
  configureGlobalCert();
  const testUrl = process.env["apps.cabinet.ws"] + "/cabinet.php";
  const authUrl =
    process.env["apps.publogin.ws"] +
    "/loginx509.php?referer-0=" +
    testUrl +
    "&required-0=80&realm-0=bbx509";

  const authRes = await fetch(authUrl);
  console.log("authRes.headers", authRes.headers);
  await checkResponse(authRes);
  const cookie = parseCookies(authRes);

  const options = {
    headers: {
      cookie,
    }
  };
  const testRes = await fetch(testUrl, options);
  console.log("testRes.headers", testRes.headers);
  await checkResponse(testRes);
  console.log(await testRes.text());
}

function parseCookies(response) {
  const raw = response.headers.raw()["set-cookie"];
  return raw
    .map((entry) => {
      const parts = entry.split(";");
      const cookiePart = parts[0];
      return cookiePart;
    })
    .join(";");
}

/**
 * throws error if response is not ok
 * @param {*} res result of fetch
 * @returns result of fetch
 */
async function checkResponse(res) {
  if (!res.ok) {
    const msg = await res.text();
    console.log("error", res.url, msg);
    throw new Error(msg);
  }
  return res;
}

function configureGlobalCert() {
  const certfile = process.env["apps.testfetch.certfile"];
  const passphrase = process.env["apps.testfetch.cert_PASSWORD"];

  Object.assign(https.globalAgent.options, configureCert(certfile, passphrase));
}
function configureCert(certfile, passphrase) {
  const cert = certfile ? fs.readFileSync(certfile) : null;
  const certConfig = {
    cert,
    key: cert,
    passphrase,
  };
  return certConfig;
}

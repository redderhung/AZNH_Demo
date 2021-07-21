import hmacSHA256 from 'crypto-js/hmac-sha256.js';
import Base64 from 'crypto-js/enc-base64.js';
import fetch from 'node-fetch';
import config from "../config.js";

const HOST = config.apiUrl;
const ConnectionString = config.connectionString;
const AZ_HEADER = {
    Accept: 'application/json',
    'Content-Type': 'application/json'
};


var getSelfSignedToken = function(targetUri, sharedKey, ruleId,
  expiresInMins) {
  targetUri = encodeURIComponent(targetUri.toLowerCase()).toLowerCase();

  // Set expiration in seconds
  var expireOnDate = new Date();
  expireOnDate.setMinutes(expireOnDate.getMinutes() + expiresInMins);
  var expires = Date.UTC(expireOnDate.getUTCFullYear(), expireOnDate
  .getUTCMonth(), expireOnDate.getUTCDate(), expireOnDate
  .getUTCHours(), expireOnDate.getUTCMinutes(), expireOnDate
  .getUTCSeconds()) / 1000;
  var tosign = targetUri + '\n' + expires;

  // using CryptoJS
  var signature = hmacSHA256(tosign, sharedKey);
  var base64signature = signature.toString(Base64);
  var base64UriEncoded = encodeURIComponent(base64signature);

  // construct autorization string
  var token = `SharedAccessSignature sr=${targetUri}&sig=${base64UriEncoded}&se=${expires}&skn=${ruleId}`;
  //var token = "SharedAccessSignature sr=" + targetUri + "&sig="
  //+ base64UriEncoded + "&se=" + expires + "&skn=" + ruleId;
  // console.log("signature:" + token);
  return token;
};

const gen_headers = (uri, extra={}) => {
    const cs = ConnectionString.split(';');
    const sakn = cs[1].replace('SharedAccessKeyName=', '');
    const sak = cs[2].replace('SharedAccessKey=', '');
    const auth = getSelfSignedToken(uri, sak, sakn, 10);
    const header = {...AZ_HEADER, ...extra, Authorization: auth};
    return header;
};

const sendMessage = () => {
    const uri = `${HOST}/messages/?api-version=2015-04`;
    const method = 'POST';
    const headers = gen_headers(uri, {"Content-Type": "application/json;charset=utf-8", "ServiceBusNotification-Format": "gcm"});
    const body = JSON.stringify({
        "notification": {
            "title": "Pizza",
            "body": "Pizzzzzzzzza"
        }
    });
    console.log(method, uri);
    console.log(headers);
    return fetch(uri, {method, headers, body})
        .then(res => {
            console.log(JSON.stringify(res))
            console.log(res.body);
        })
        .catch(err => {
           console.error(err)
        });
}

sendMessage()

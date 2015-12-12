var crypto = require('crypto');

function calcHMAC(url, method, body, nonce, key) {
  if (!key) {
    throw new Error('key not specified');
  }

  return crypto.createHmac('sha256', key).update(nonce + url + method + body).digest('hex');
}

function sendAuthError(res) {
  res.status(401).json({
    error: 'authentication required'
  });
}

function verify(apiKeys) {
  return function (req, res, next) {
    var method = req.method;
    var body, hmac;

    if (Object.keys(req.body).length) {
      body = JSON.stringify(req.body);
    } else {
      body = '';
    }

    try {
      hmac = calcHMAC(req.originalUrl, method, body, req.headers['x-api-nonce'], apiKeys[req.headers['x-api-key']]);
    } catch (e) {
      sendAuthError(res);
      return;
    }

    if (req.headers['x-api-sign'] != hmac) {
      sendAuthError(res);
      return;
    }

    next();
  };
}

exports.verify = verify;
exports.calcHMAC = calcHMAC;

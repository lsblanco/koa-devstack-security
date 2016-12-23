'use strict'

var jwt        = require('jsonwebtoken');
var appRoot    = require('app-root-path');
var config     = require(appRoot + '/configuration.json');
var rp = require('request-promise');

/**
* Midleware validation token
*
*/

var token    =  '';
module.exports = function() {
  const bearer =  'bearer';
  return function checktoken (ctx, next) {
    if (ctx == null || ctx === 0 || Object.keys(ctx).length === 0){
      return ctx.throw(401, 'Bad Authorization header format. Format is "Authorization: Bearer <token>"\n');
    }else {
      const authorization  = ctx.request.headers.authorization;
      if (authorization) {
        var parts = authorization.split(' ');
        if (parts.length === 2 && parts[0] === bearer) {
          token = parts[1];
          ctx.state.authorizationHeader = authorization;
          validateToken();
          return next();
        }else{
          return ctx.throw(401, 'Bad Authorization header format. Format is "Authorization: Bearer <token>"\n');
        }
      }else{
        return ctx.throw(401,"JWT token is mandatory");
      }
    }
  }
}

/**
* This function is in charge on get the public key and validate it.
*
*
*/
async function   validateToken() {
      var serverPublicKey = config.publicKeyProvider.url + '/' + config.publicKeyProvider.keyIdentifier;
      console.log("serverPublicKey",serverPublicKey);
      var publicKey="";
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
      var options = {
        url: serverPublicKey,
        headers: { 'User-Agent': 'request' }
      };
      rp(serverPublicKey)
        .then(function (htmlString) {
          var info = JSON.parse(htmlString);
          publicKey = info.key;
          verifyToken(publicKey);
        })
        .catch(function (err) {
            console.log("Error",err);
        });
      console.log("token es",publicKey);
}

/**
* This function validate the jwt token
*
* @param  {string} publicKey The public key.
* @throw  error 401 if the token has expired.
*/

function verifyToken(publicKey){
      try{
        var decoded = jwt.verify(token, base64toPem(publicKey), { algorithms: ['RS256'] });
      }catch(err){
        return ctx.throw(401,"The JWT token is invalid");
      }
      if (decoded.exp < Date.now() / 1000) {
          return ctx.throw(401,"This JWT has expired");
      }
}

/**
* This function convert the key to a pem file.
*
* @param  {string} input The text to convert a pem file.
* @return {String} The resolved token
*/
function base64toPem(input){
  console.log(input);
  var begin = "-----BEGIN PUBLIC KEY-----\n";
  var end   = "-----END PUBLIC KEY-----"
  for(var result="", lines=0;result.length-lines < input.length;lines++) {
          result+=input.substr(result.length-lines,64)+"\n"
      }
  return begin + result + end;
}

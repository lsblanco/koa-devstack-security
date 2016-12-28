'use strict'

var jwt        = require('jsonwebtoken');
var appRoot    = require('app-root-path');
var config     = require(appRoot + '/configuration.json');
var rp         = require('request-promise');


/**
* Midleware validation and propagation token
*
*/
var token;
var publicKey;
module.exports = function(opts) {
  const bearer =  'bearer';
  return async function checktoken (ctx, next) {
    if (ctx == null || ctx === 0 || Object.keys(ctx).length === 0){
      return ctx.throw(401, 'Bad Authorization header format. Format is "Authorization: Bearer <token>"\n');
    }else {
      const authorization  = ctx.request.headers.authorization;
      if (authorization) {
        var parts = authorization.split(' ');
        if (parts.length === 2 && parts[0] === bearer) {
          token = parts[1];
          ctx.state.authorizationHeader = authorization;
          await  getPublicKey(ctx);
          verifyToken(ctx,publicKey);
          return next();
        }else{
          return ctx.throw(401, 'Bad Authorization header format. Format is "Authorization: Bearer <token>"\n');
        }
      }else{
        return ctx.throw(401,'JWT token is mandatory');
      }
    }
  }
}


/**
* This method call to server public key and get it.
* @param {ctx} ctx , application koa context
*/
async function getPublicKey(ctx){
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  var serverPublicKey = config.publicKeyProvider.url + '/' + config.publicKeyProvider.keyIdentifier;
  var attempts = config.publicKeyProvider.attempts;
  while(attempts > 0){
    await rp(serverPublicKey)
      .then(function (htmlString) {
        var info = JSON.parse(htmlString);
        publicKey = info.key;
        return;
      })
      .catch(function (err) {
        sleep(config.publicKeyProvider.delay);
        if (attempts > 1){
          attempts = attempts - 1;
        }else{
          return ctx.throw(405, 'public key server is not enabled');
        }
    });
  }
}

/**
* Sleep function, wait n miliseconds
* @param {integer} miliseconds number of miliseconds to wait
*/
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

/**
* This function validate the jwt token
*
* @param  {string} publicKey The public key.
* @throw  error 401 if the token has expired.
*/

function verifyToken(ctx, publicKey){
      try{
         decoded = jwt.verify(token, base64toPem(publicKey), { algorithms: ['RS256'] });
      }catch(err){
        return ctx.throw(405, 'The Token is Invalid and the verification fail\n');
      }
}

/**
* This function convert the key to a pem file.
*
* @param  {string} input The text to convert a pem file.
* @return {String} The resolved token
*/
function base64toPem(input){
  var begin = '-----BEGIN PUBLIC KEY-----\n';
  var end   = '-----END PUBLIC KEY-----';
  for(var result="", lines=0;result.length-lines < input.length;lines++) {
          result+=input.substr(result.length-lines,64)+"\n"
      }
  return begin + result + end;
}

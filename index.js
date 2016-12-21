'use strict'

var koa = require('koa');
var _JWT     = require('jsonwebtoken');
const morgan = require('koa-morgan');
var request = require('koa-request');
var bodyParser = require('koa-bodyparser');


var appRoot = require('app-root-path');
var config = require(appRoot + '/configuration.json');

var publicKey = "";

//var JWT = {decode: _JWT.decode, sign: _JWT.sign, verify: thunkify(_JWT.verify)};

module.exports = function(opts) {

  var token    =  '';
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
          getPublicKey();
          verifyToken(token);
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

function getPublicKey(){
  console.log("Entra");
  var serverPublicKey = config.publicKeyProvider.url + '/' + config.publicKeyProvider.keyIdentifier;
  console.log(serverPublicKey);
  var options = {
    	url: serverPublicKey,
        headers: { 'User-Agent': 'request' }
  };

  var response =  await request(options);
  console.log("response",response);
  var info = JSON.parse(response.body);
  publicKey = info.key;
  return;
}

function verifyToken(token){
  console.log(token);
  try{
  //
    var decoded = jwt.verify(token, pubKeyParsed, { algorithms: ['RS256'] });
    return true;
  }
  catch(err){
    return false;
  }
}

function checkAuthorizationHeader(opts){

  if (!this.header || !this.header.authorization){
    this.throw("JWT token is bad formatted",401);
  }

  var parts = this.header.authorization.split(' ');
  if (parts.length == 2 && parts[0] === bearer)
    return parts[1];
  else
    this.throw(401, 'Bad Authorization header format. Format is "Authorization: Bearer <token>"\n');

}

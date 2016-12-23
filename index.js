'use strict'

var jwt        = require('jsonwebtoken');
var appRoot    = require('app-root-path');
var config     = require(appRoot + '/configuration.json');
var rp         = require('request-promise');





//var JWT = {decode: _JWT.decode, sign: _JWT.sign, verify: thunkify(_JWT.verify)};


module.exports = function() {

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
          console.log("Verificamos");
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





/*var koa = require('koa');
var request = require('koa-request');

var app = new koa();

app.use(function *() {
  var serverPublicKey = config.publicKeyProvider.url + '/' + config.publicKeyProvider.keyIdentifier;
  var publicKey="";
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
	//var response = yield request(options); //Yay, HTTP requests with no callbacks!
	//var info = JSON.parse(response.body);
      var options = {
      	url: serverPublicKey,
  	    headers: { 'User-Agent': 'request' }
  	  };
  	  var response = yield request(options); //Yay, HTTP requests with no callbacks!
  	  var info = JSON.parse(response.body);

      var decoded = jwt.verify('eyJraWQiOiJJRFBTRVJFTklUWV9TSEExd2l0aFJTQSIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJ4MDIxMDk2IiwiYXVkIjoiU0FSQVNFUkVOSVRZIiwibmJmIjoxNDczNzU5ODk0LCJpc3MiOiJJRFBTRVJFTklUWSIsImV4cCI6MzYwMTQ3Mzc1OTg5NCwiaWF0IjoxNDczNzU5ODk0LCJqdGkiOiI5MDgxMTk0NS1jMjIyLTRkOWQtYWY5NS04MjAwOTRiMDg3ZmYifQ.a5hNefm9KuEfp-cjt9_-p6tSeMEVMvHVHAry175eV_dOVloPB0gKnlh4x7GbTc4egpstX0JNZzMN5pojLHj4efW-1fREIWpzyGuup4KXoqLXcJxihx22x1-Fmru2dkeY2tPVIwI99sCIn_RdwyPhDALK6WsRO3OOe8_MRSitTYfObaQLLQ-QMyrh8Yygc9FQvcxKOgH7S8dwrU4IcnUOxJAW7tCq_0xZtBd_HRfEzhCIytIfcSxw1gvRNbuxgx5ZDgwOvqgJCS4MyK6ye1Di6ZITvNq5oYNJ5aA5qyohqJ_M-Q1INaBnVO5qUIotjG0m_9WH1OcCVJr_U_86aCoDCg',
      convertCertificate(info.key), { algorithms: ['RS256'] });
      console.log("El decoded es: ",decoded);
});

app.listen(process.env.PORT || 8080);*/
async function setHeader(ctx,next){
    ctx.state.authorizationHeader = 'Key ' + "clave";
    await next();
}


function  getPublicKey() {
  var serverPublicKey = config.publicKeyProvider.url + '/' + config.publicKeyProvider.keyIdentifier;
  var publicKey="";
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  var options = {
    url: serverPublicKey,
    headers: { 'User-Agent': 'request' }
  };
  var response = yield request(options);
  var info = JSON.parse(response.body);
}

/**
*
*
**/
function verifyToken(token){
  console.log(token);
  try{
    var decoded = jwt.verify(token, convertCertificate(publicKey), { algorithms: ['RS256'] });
    return true;
  }
  catch(err){
    return false;
  }
}


function convertCertificate(input){
  var header = "-----BEGIN PUBLIC KEY-----\n";
  var end = "\n-----END PUBLIC KEY-----";
  var enter = "\n";
  var cont = 1;
  var output = '';
  for(var i=0; i<input.length; i++){
    output = output + input.charAt(i);
    if(cont == 64){
      output = output + enter;
      cont = 0;
    }
    cont = cont +1;
  }
  output = header + output + end;
  return output;
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

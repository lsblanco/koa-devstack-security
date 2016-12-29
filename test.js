'use strict'

const koajwt  = require('./index')
const request = require('supertest')
var koa       = require('koa');


//  const app = new Koa();
//  const inst = app.listen(4000);

describe('Test authorization header',() => {
    it('should throw 401 if no authorization header',  function(done) {
        var app = new koa();
        app.use(koajwt({ secret: 'shhhh' }));
        request(app.listen())
          .get('/')
          .expect(401)
          .end(done);
    });
    it('should throw 403 if authorization header is present and invalid',   function(done){
       this.timeout(15000);
        var app = new koa();
        app.use(koajwt({ secret: 'shhhh' }));
        request(app.listen())
          .get('/')
          .set('Authorization', 'bearer 1234567890')
          .expect(403)
          .end(done);
    });
    it('should throw 401 with bad formated token',  function(done) {
        this.timeout(15000);
        var app = new koa();
        app.use(koajwt({ secret: 'shhhh' }));
        request(app.listen())
          .get('/')
          .set('Bla', 'bla1234567890')
          .expect(401)
          .end(done);

    });
    it('should throw 403 with invalid token JWT',  function(done) {
        this.timeout(15000);
        var app = new koa();
        app.use(koajwt({ secret: 'shhhh' }));
        request(app.listen())
          .get('/')
          .set('Authorization', 'bearer eyJraWQiOiJJRFBTRVJFTklUWV9TSEExd2l0aFJTQSIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJ4MDIxMDk2IiwiYXVkIjoiU0FSQVNFUkVOSVRZIiwibmJmIjoxNDczNzU5ODk0LCJpc3MiOiJJRFBTRVJFTklUWSIsImV4cCI6MzYwMTQ3Mzc1OTg5NCwiaWF0IjoxNDczNzU5ODk0LCJqdGkiOiI5MDgxMTk0NS1jMjIyLTRkOWQtYWY5NS04MjAwOTRiMDg3ZmYifQ.a5hNefm9KuEfp-cjt9_-p6tSeMEVMvHVHAry175eV_dOVloPB0gKnlh4x7GbTc4egpstX0JNZzMN5psojLHj4efW-1fREIWpzyGuup4KXoqLXcJxihx22x1-Fmru2dkeY2tPVIwI99sCIn_RdwyPhDALK6WsRO3OOe8_MRSitTYfObaQLLQ-QMyrh8Yygc9FQvcxKOgH7S8dwrU4IcnUOxJAW7tCq_0xZtBd_HRfEzhCIytIfcSxw1gvRNbuxgx5ZDgwOvqgJCS4MyK6ye1Di6ZITvNq5oYNJ5aA5qyohqJ_M-Q1INaBnVO5qUIotjG0m_9WH1OcCVJr_U_86aCoDCg')
          .expect(403)
          .end(done);

    });
    it('should throw 404 with valid token', function(done) {
      this.timeout(15000);
      var app = new koa();
      app.use(koajwt({ secret: 'shhhh' }));
      request(app.listen())
        .get('/')
        .set('Authorization', 'bearer eyJraWQiOiJJRFBTRVJFTklUWV9TSEExd2l0aFJTQSIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJ4MDIxMDk2IiwiYXVkIjoiU0FSQVNFUkVOSVRZIiwibmJmIjoxNDczNzU5ODk0LCJpc3MiOiJJRFBTRVJFTklUWSIsImV4cCI6MzYwMTQ3Mzc1OTg5NCwiaWF0IjoxNDczNzU5ODk0LCJqdGkiOiI5MDgxMTk0NS1jMjIyLTRkOWQtYWY5NS04MjAwOTRiMDg3ZmYifQ.a5hNefm9KuEfp-cjt9_-p6tSeMEVMvHVHAry175eV_dOVloPB0gKnlh4x7GbTc4egpstX0JNZzMN5pojLHj4efW-1fREIWpzyGuup4KXoqLXcJxihx22x1-Fmru2dkeY2tPVIwI99sCIn_RdwyPhDALK6WsRO3OOe8_MRSitTYfObaQLLQ-QMyrh8Yygc9FQvcxKOgH7S8dwrU4IcnUOxJAW7tCq_0xZtBd_HRfEzhCIytIfcSxw1gvRNbuxgx5ZDgwOvqgJCS4MyK6ye1Di6ZITvNq5oYNJ5aA5qyohqJ_M-Q1INaBnVO5qUIotjG0m_9WH1OcCVJr_U_86aCoDCg')
        .expect(404)
        .end(done);

    });
    it('should throw 403 with expired token', function(done) {
      this.timeout(15000);
      var app = new koa();
      app.use(koajwt({ secret: 'shhhh' }));
      request(app.listen())
        .get('/')
        .set('Authorization', 'bearer cyJraKWQiOiJJRFBTRVJFTklUWV9TSEExd2l0aFJTQSIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJ4MDIxMDk2IiwiYXVkIjoiU0FSQVNFUkVOSVRZIiwibmJmIjoxNDczNzU5ODk0LCJpc3MiOiJJRFBTRVJFTklUWSIsImV4cCI6MzYwMTQ3Mzc1OTg5NCwiaWF0IjoxNDczNzU5ODk0LCJqdGkiOiI5MDgxMTk0NS1jMjIyLTRkOWQtYWY5NS04MjAwOTRiMDg3ZmYifQ.a5hNefm9KuEfp-cjt9_-p6tSeMEVMvHVHAry175eV_dOVloPB0gKnlh4x7GbTc4egpstX0JNZzMN5pojLHj4efW-1fREIWpzyGuup4KXoqLXcJxihx22x1-Fmru2dkeY2tPVIwI99sCIn_RdwyPhDALK6WsRO3OOe8_MRSitTYfObaQLLQ-QMyrh8Yygc9FQvcxKOgH7S8dwrU4IcnUOxJAW7tCq_0xZtBd_HRfEzhCIytIfcSxw1gvRNbuxgx5ZDgwOvqgJCS4MyK6ye1Di6ZITvNq5oYNJ5aA5qyohqJ_M-Q1INaBnVO5qUIotjG0m_9WH1OcCVJr_U_86aCoDCa')
        .expect(403)
        .end(done);

    });
  })

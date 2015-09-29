describe('record tests', function(tnv) {
  var scope = {};


  before(function(done) {
    scope.app = tnv.express();

    scope.app.use(tnv.bodyParser.json());

    scope.app.use(function(req, res, next) {
      res.once('finish', function() {
        tnv.expressDocu.record({
          req: req,
          res: res
        }, function(err) {
          throw err;
        });
      });

      next();
    });

    scope.app.post('/route1', function(req, res) {
      res.status(400).json({ error: { name: 'ValidationError' } });
    });

    // TODO: RESPONSE NOT AVAILABLE
    scope.app.get('/route1/:param', function(req, res) {
      res.status(400).json({ error: { name: 'ValidationError' } });
    });

    scope.server = tnv.http.createServer(scope.app);
    scope.server.listen(9090, 'localhost');
    done();
  });


  after(function() {
    //scope.server.close();
  });


  it('record error without url params', function(done) {
    tnv.sinon.stub(tnv.fs, 'writeFile', function(fileName, body) {
      tnv.fs.writeFile.restore();

      body = JSON.parse(body);
      console.log(body);
      done();
    });

    tnv.request(scope.server)
      .post('/route1')
      .send({
        key1: 'value1'
      })
      .end(function(err, res) {
        should.not.exist(err);
      });
  });


  it('record error with url params', function(done) {
    tnv.sinon.stub(tnv.fs, 'writeFile', function() {
      tnv.fs.writeFile.restore();
      done();
    });

    tnv.request(scope.server)
      .get('/route1/123455')
      .end(function(err, res) {
        should.not.exist(err);
      });
  });
});
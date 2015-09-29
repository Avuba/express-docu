describe('record tests', function(tnv) {
  var scope = {};


  before(function(done) {
    scope.app = tnv.express();
    scope.app.use(tnv.bodyParser.json());

    scope.app.use(tnv.expressDocu.record);

    scope.app.post('/route1', function(req, res) {
      res.status(400).json({ error: { name: 'ValidationError' } });
    });

    scope.app.get('/route1/:param', function(req, res) {
      res.status(200).json({ userId: '1234' });
    });

    scope.server = tnv.http.createServer(scope.app);
    scope.server.listen(9090, 'localhost');
    done();
  });


  after(function() {
    //scope.server.close();
  });


  it('record error without url params', function(done) {
    tnv.sinon.stub(tnv.fs, 'writeFile', function(fileName, file) {
      tnv.fs.writeFile.restore();

      file = JSON.parse(file);
      file.method.should.eql('POST');
      file.status.should.eql(400);
      file.request.body.key1.should.eql('value1');
      file.response.body.error.name.should.eql('ValidationError');

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
    tnv.sinon.stub(tnv.fs, 'writeFile', function(fileName, file) {
      tnv.fs.writeFile.restore();

      file = JSON.parse(file);
      file.method.should.eql('GET');
      file.status.should.eql(200);
      file.request.params.param.should.eql('123455');
      file.response.body.userId.should.eql('1234');

      done();
    });

    tnv.request(scope.server)
      .get('/route1/123455')
      .end(function(err, res) {
        should.not.exist(err);
      });
  });
});
describe('generate tests', function(tnv) {
  it('generate', function(done) {
    tnv.sinon.stub(tnv.jade, 'compile', function() {
      tnv.jade.compile.restore();

      return function(data) {
        should.exist(data.groups.group1);
        should.exist(data.groups.group1['PUT /group1/user/device']);
        done();
      }
    });

    tnv.expressDocu.generate({ path: __dirname + '/assets/recorded'});
  });
});
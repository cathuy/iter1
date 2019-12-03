var chai = require('chai');
  var chaiHttp = require('chai-http');
  var server = require('../server/app');
  var should = chai.should();

describe("checking for Voting", function(done) {
  it("voting is working!", (err, res) => {
    var nameArray = ["April", "Wendy", "Claire", "A", "B", "C", "D"];
    var initVoteArray = ["0", "0", "0", "0", "0", "0", "0"];
    chai
      .request(app)
      .post("/voting")
      .send({
        nameArray,
        initVoteArray
      })
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

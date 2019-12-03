var chai=require('chai');
var chaiHttp=require('chai-http');
var should=chai.should();

describe('share', function() {

    before(function() {
        this.server = http.createServer(app).listen(5050);
        this.browser = new Browser({ site: 'http://localhost:5050' });
    });
    it('chatroom screen show up');
    // load the contact page
    before(function(done) {
        this.browser.visit('/chatRoom', done);
        it('should show contact a form', function() {
            assert.ok(this.browser.success);
        });
    });

});


describe('.roomurl', function() {

    before(function() {
        this.server = http.createServer(app).listen(5050);
        this.browser = new Browser({ site: 'http://localhost:5050' });
    });

    // load the contact page before each test
    beforeEach(function(done) {
        this.browser.visit('/charRoom', done);
    });

    it('should show contact a form', function() {
        assert.ok(this.browser.success);
        assert.equal(this.browser.text('#yourCode'), 'ROOMCODE');

    });

    it('should refuse empty submissions', function(done) {
        var browser = this.browser;
        browser.pressButton('Send').then(function() {
            assert.ok(browser.success);
            assert.equal(browser.text('#yourCode'), 'ROOMCODE');

            assert.equal(browser.text('div.alert'), 'Please fill in all the fields');
        }).then(done, done);
    });

    it('should refuse partial submissions', function(done) {
        var browser = this.browser;
        browser.fill('first_name', 'John');
        browser.pressButton('Send').then(function() {
            assert.ok(browser.success);

            assert.equal(browser.text('#yourCode'), 'ROOMCODE');
            assert.equal(browser.text('div.alert'), 'Please fill in all the fields');
        }).then(done, done);
    });

    it('should keep values on partial submissions', function(done) {
        var browser = this.browser;
        browser.fill('ROOMCODE');
        browser.pressButton('Send').then(function() {
            assert.equal(browser.field('ROOMCODE').value, 'ROOMCODE');
        }).then(done, done);
    });

    it('should refuse invalid ROOMCODE', function(done) {
        var browser = this.browser;
        browser.fill('ROOMCODE');
        browser.pressButton('Send').then(function() {
            assert.ok(browser.success);
            ssert.equal(browser.text('#yourCode'), 'ROOMCODE');

            assert.equal(browser.text('div.alert'), 'Please check the email address format');
        }).then(done, done);
    });

    it('should accept complete submissions', function(done) {
        var browser = this.browser;

        browser.fill('ROOMCODE');
        browser.pressButton('Send').then(function() {
            assert.ok(browser.success);
            ssert.equal(browser.text('#yourCode'), 'ROOMCODE');
            assert.equal(browser.text('p'), 'Thank you for your message. We\'ll answer you shortly.');
        }).then(done, done);
    });

    after(function(done) {
        this.server.close(done);
    });

});
//timer test
var clock;
beforeEach(function () {
     clock = sinon.useFakeTimers();
 });

afterEach(function () {
    clock.restore();
});

it("should time out after 30s", function() {
    var timedOut = false;
    setTimeout(function () {
        timedOut = true;
    }, 30);

    timedOut.should.be.false;
    clock.tick(30);
    timedOut.should.be.true;
});
//word generator test
randomWordsResult = app. randomWords();
synonymResult = app.tcom.search(word).synonyms[0]
describe('wordAPI', function(){
  describe('randomWords()', function(){
    it('a random word should be created', function(){
      assert.equal(randomWordsResult,'word');
    });

  });
  describe('tcom.search(word).synonyms[0]', function(){
    it('a synonym of random word be generatoed', function(){
      assert.equal(synonymResult, 'synonym');
    });

  });

 
});

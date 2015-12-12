require('should');
var request = require('supertest');
var apikey = require('../apikey.js');
var index = require('../index');

// Set API_KEY here
var API_KEY_SECRET = 'secure_api_key';
var API_KEY_ID = 'APIKEY1';

describe('create and get a contact', function () {
    var id;
    var contact_data = {
        'name': 'test name',
        'email': 'test email'
    };

    it('should create a contact', function (done) {
        var url = '/api/1/contacts';
        var nonce = Date.now();
        var signature = apikey.calcHMAC(url, 'POST', JSON.stringify(contact_data), nonce, API_KEY_SECRET);

        request(index)
            .post(url)
            .set('X-API-Key', API_KEY_ID)
            .set('X-API-Nonce', nonce)
            .set('X-API-Sign', signature)
            .send(contact_data)
            .expect(200)
            .end(function (err, res) {
                if (err) throw err;
                id = res.body.id;
                done();
            });
    });

    it('should get a contact', function (done) {
        var url = '/api/1/contacts/' + id;
        var nonce = Date.now();
        var signature = apikey.calcHMAC(url, 'GET', '', nonce, API_KEY_SECRET);

        request(index)
            .get(url)
            .set('X-API-Key', API_KEY_ID)
            .set('X-API-Nonce', nonce)
            .set('X-API-Sign', signature)
            .expect(200)
            .end(function (err, res) {
                if (err) throw err;
                res.body.contacts[0].id.should.equal(id);
                res.body.contacts[0].email.should.equal(contact_data.email);
                res.body.contacts[0].name.should.equal(contact_data.name);
                done();
            });
    });
});

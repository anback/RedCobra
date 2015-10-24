var USER = 'andersback';
var PASS = 'EXI1R2k4Sqjk';
var fs = require('fs');
var ursa = require('ursa');

function login(user, pass, fn) {
    var auth = encryptLogin(user, pass, './resources/NEXTAPI_TEST_public.pem');
    var opts = {
        headers: {
            'Accept': 'application/json'
        },
        data: {
            service: 'NEXTAPI',
            auth: auth
        }
    }

    return Meteor.post('https://api.test.nordnet.se/next/2/login', opts);
}

function encryptLogin(user, pass, keyfile) {
    var rsaPublic = fs.readFileSync(keyfile, 'ascii');
    var key = ursa.createPublicKey(rsaPublic, 'utf8');

    if (!key) {
        console.log('KEY error');
    }

    var auth = new Buffer(user).toString('base64');
    auth += ':';
    auth += new Buffer(pass).toString('base64');
    auth += ':';
    auth += new Buffer('' + new Date().getTime()).toString('base64');
    return key.encrypt(auth, 'utf8', 'base64', ursa.RSA_PKCS1_PADDING);
}

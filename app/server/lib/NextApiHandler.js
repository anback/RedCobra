var fs = Meteor.npmRequire('fs');
var ursa = Meteor.npmRequire('ursa');

NextApiHandler = class {
    constructor() {
        this.baseUrl = 'https://api.test.nordnet.se/next/2';
        this.session = this.login(Meteor.settings.nextUser, Meteor.settings.nextPass)
    }

    sendRequest(url, method = 'get', opts = {}) {
        opts.headers = this.getHeaders();
        return HTTP.call(method,this.baseUrl + url, opts).data;
    } 

    getAccounts() {
        return this.sendRequest('/accounts');
    }

    getHeaders() {

        var res = {
            'Accept': 'application/json',
        }
        
        
        if(this.session)
            res.Authorization =  'Basic ' + new Buffer(`${this.session.session_key}:${this.session.session_key}`).toString('base64')

        console.log(res);
        return res;
    }

    login(user, pass) {
        var auth = this.encryptLogin(user, pass, process.env.PWD + '/server/resources/NEXTAPI_TEST_public.pem');
        var opts = {
            headers: this.getHeaders(),
            data: {
                service: 'NEXTAPI',
                auth: auth
            }
        }
        return this.sendRequest('/login', 'post', opts)
    }

    encryptLogin(user, pass, keyfile) {
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
}

var fs = Meteor.npmRequire('fs');
var ursa = Meteor.npmRequire('ursa');

NextApiHandler = class {
    constructor() {
        this.session = NextApiHandler.login(Meteor.settings.nextUser, Meteor.settings.nextPass)
    }

    static login(user, pass) {
        var auth = this.encryptLogin(user, pass, process.env.PWD + '/server/resources/NEXTAPI_TEST_public.pem');
        var opts = {
            headers: {
                'Accept': 'application/json'
            },
            data: {
                service: 'NEXTAPI',
                auth: auth
            }
        }
        return HTTP.post('https://api.test.nordnet.se/next/2/login', opts).data;
    }

    static encryptLogin(user, pass, keyfile) {
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

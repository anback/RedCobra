var fs = Meteor.npmRequire('fs');
var ursa = Meteor.npmRequire('ursa');

NextApiHandler = class {
    constructor(marketsRepository) {
        this.baseUrl = 'https://api.test.nordnet.se/next/2';
        this.session = this.login(Meteor.settings.nextUser, Meteor.settings.nextPass)
        this.accountNo = '9211238';
        this.marketsRepository = marketsRepository;
    }

    sendRequest(url, method = 'get', params = {}, opts = {}) {
        opts.headers = this.getHeaders();

        console.log(params)
        params = Util.toArray(params)
        console.log(params)

        if (params.length > 0) {
            url += '?'
            url += Array.from(params).reduce((a, b) => {

                if (a != '')
                    a += '&amp;';

                return a + `${b.key}=${b.value}`
            }, '');
        }

        url = this.baseUrl + url;
        console.log(url);

        return HTTP.call(method, url, opts).data;
    }

    getMarkets() {
        return this.sendRequest('/markets');
    }

    getAccounts() {
        return this.sendRequest('/accounts');
    }

    getAccount(accNo = this.accountNo) {
        return this.sendRequest(`/accounts/${accNo}`)
    }

    getInstrument(sharevilleInstrument) {
        var markets = this.marketsRepository.getMarkets(sharevilleInstrument.country);

        let data = {};

        markets.every(market => {
            var params = {
                query: sharevilleInstrument.name,
                marketID: market.market_id,
                type: 'A'
            }

            data = this.sendRequest('/instruments', 'get', params);

            //console.log(data);

            data = data.filter(x => x.symbol === sharevilleInstrument.symbol)

            if(data.length > 0)
                return false;
            return true;
        })

        return data;
    }

    getHeaders() {

        var res = {
            'Accept': 'application/json',
        }


        if (this.session)
            res.Authorization = 'Basic ' + new Buffer(`${this.session.session_key}:${this.session.session_key}`).toString('base64')

        console.log(res);
        return res;
    }

    login(user, pass) {
        var auth = this.encryptLogin(user, pass, process.env.PWD + '/server/resources/NEXTAPI_TEST_public.pem');
        var opts = {
            data: {
                service: 'NEXTAPI',
                auth: auth
            }
        }
        return this.sendRequest('/login', 'post', undefined, opts)
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

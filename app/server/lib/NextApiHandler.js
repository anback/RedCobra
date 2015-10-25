var fs = Meteor.npmRequire('fs');
var ursa = Meteor.npmRequire('ursa');

NextApiHandler = class {
    constructor(marketsRepository) {
        this.baseUrl = 'https://api.test.nordnet.se/next/2';
        this.session = this.login(Meteor.settings.nextUser, Meteor.settings.nextPass)
        this.accountNo = '9211238';
        this.marketsRepository = marketsRepository;
    }

    get(url, params = {}, opts = {}) {
        return this.sendRequest(url, 'get', params, opts);
    }

    post(url, params = {}, opts = {}) {
        return this.sendRequest(url, 'post', params, opts);
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

    sendOrder(order) {
        return this.post(`/accounts/${this.accountNo}/orders`, {
            identifier : order.instrument.instrument_id,
            marketID : order.instrument.marketID,
            price : order.price,
            volume : order.volume,
            side : order.side,
            currency : order.instrument.currency
        });
    }

    getMarkets() {
        return this.get('/markets');
    }

    getAccounts() {
        return this.get('/accounts');
    }

    getAccount(accNo = this.accountNo) {
        return this.get(`/accounts/${accNo}`)
    }

    getPrice(instrument) {
        //Skiten funkar nog inte på helger
        return 57.0;

        return this.get('/chart_data', {
            identifier : instrument.instrument_id,
            marketID : instrument.marketID
        })
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

            data = this.get('/instruments', params);

            //console.log(data);

            data = data.filter(x => x.symbol === sharevilleInstrument.symbol)

            if(data.length > 0)
            {
                data[0].marketID = market.market_id
                return false;
            }
            return true;
        })

        return data[0];
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
        return this.post('/login', undefined, opts)
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

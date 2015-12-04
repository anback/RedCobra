var fs = Meteor.npmRequire('fs');
var ursa = Meteor.npmRequire('ursa');

NextApiHandler = class {
    constructor(marketsRepository) {
        this.baseUrl = 'https://api.test.nordnet.se/next/2';
        this.session = this.getSession();
        console.log(this.session);
        this.accountNo = '9211238';
        this.marketsRepository = marketsRepository;
        this.cachedRequests = {};
    }

    getSession() {

        if (Meteor.settings.session_key != "")
            return {
                session_key: Meteor.settings.session_key
            }

        return this.login(Meteor.settings.nextUser, Meteor.settings.nextPass)
    }


    get(url, params = {}, opts = {}, shouldUseCache = true) {

        params = Util.toArray(params)

        if (params.length > 0) {
            url += '?'
            url += Array.from(params).reduce((a, b) => {

                if (a != '')
                    a += '&amp;';

                return a + `${b.key}=${b.value}`
            }, '');
        }

        //Get Cached Results
        var res = this.getCachedResult(url);
        if (res && shouldUseCache) {
            console.log(`CACHED get -> ${url}`);
            return res;
        }

        var res = this.sendRequest(url, 'get', params, opts);

        //Set Cached Results
        this.setCachedResult(url, res);

        return res;
    }

    post(url, opts) {

        console.log(opts);
        return this.sendRequest(url, 'post', undefined, opts);
    }

    delete(url, opts) {
        console.log(opts);
        return this.sendRequest(url, 'delete', undefined, opts);
    }

    update(url, opts) {
        console.log(opts);
        return this.sendRequest(url, 'put', undefined, opts)
    }

    getCachedResult(url) {
        return this.cachedRequests[url];
    }

    setCachedResult(url, res) {
        this.cachedRequests[url] = res;
    }

    sendRequest(url, method = 'get', params = {}, opts = {}) {

        url = this.baseUrl + url;

        opts.headers = this.getHeaders();

        //Call Service
        console.log(`${method} -> ${url}`);
        res = HTTP.call(method, url, opts).data;

        return res;
    }

    sendOrder(order) {
        var res = this.post(`/accounts/${this.accountNo}/orders`, {
            data: {
                identifier: order.instrument.tradables[0].identifier,
                market_id: order.instrument.tradables[0].market_id,
                price: order.price,
                volume: order.volume,
                side: order.side,
                currency: order.instrument.currency
            }
        });
        console.log("send order")
        console.log(res)
        return res;
    }

    updateOrder(order_id, volume) {
        var res = this.update(`/accounts/${this.accountNo}/orders/${order_id}`, {
            data: {
                volume: volume
            }
        })
        console.log("update order")
        console.log(res)
        return res;
    }

    deleteOrder(order) {
        return this.delete(`/accounts/${this.accountNo}/orders/${order.order_id}`)
    }

    getOrders() {
        return this.get(`/accounts/${this.accountNo}/orders`, undefined, undefined, false);
    }

    getMarkets() {
        return this.get('/markets');
    }

    getAccounts() {
        return this.get('/accounts');
    }

    getAccount(accNo = this.accountNo) {
        var account = this.get(`/accounts/${accNo}`)
        return new Account(account.account_sum.value,
            account.full_marketvalue.value,
            account.account_currency,
            account.trading_power.value)
    }

    getAccountPositions(accNo = this.accountNo) {

        var res = this.get(`/accounts/${accNo}/positions`)
        return res;
    }

    getPrice(instrument) {

        return this.get('/chart_data', {
            identifier: instrument.instrument_id,
            marketID: instrument.marketID
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

            if (data.length > 0) {
                data[0].marketID = market.market_id
                data[0].sharevilleInstrumentId = sharevilleInstrument.instrument_id
                return false;
            }
            return true;
        })

        //Cert Code
        /*
        if (!data[0])
            throw new Error("Could not find instrument " + sharevilleInstrument.name)
        */

        return data[0];
    }

    getHeaders() {

        var res = {
            'Accept': 'application/json',
        }


        if (this.session)
            res.Authorization = 'Basic ' + new Buffer(`${this.session.session_key}:${this.session.session_key}`).toString('base64')

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
        return this.post('/login', opts)
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

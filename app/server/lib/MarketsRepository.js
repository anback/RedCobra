MarketsRepository = class {
    constructor(nextApiHandler) {

        //var markets = nextApiHandler.getMarkets();
        var markets = this.getMarkets();
        markets.forEach((market) => {
            Markets.upsert({
                market_id: market.market_id
            }, {
                $set: market
            })
        })
    }

    getMarkets(countryCode) {
        return Markets.find({
            country: countryCode
        }).map(x => x);
    }

    getMarkets() {
        return [{
                market_id: 80,
                is_virtual: true,
                name: 'Smart order'
            },

            {
                market_id: 40,
                country: 'SE',
                name: 'Saxess SE SOX'
            }, {
                market_id: 23,
                country: 'DK',
                name: 'OM Denmark'
            },

            {
                market_id: 12,
                country: 'SE',
                name: 'OM Sweden'
            },

            {
                market_id: 14,
                country: 'DK',
                name: 'Nasdaq OMX Copenhagen'
            },

            {
                market_id: 30,
                country: 'SE',
                name: 'Burgundy Sweden'
            },

            {
                market_id: 33,
                country: 'FI',
                name: 'Burgundy Finland'
            },

            {
                market_id: 26,
                country: 'CA',
                name: 'Canadian Venture Exchange'
            },

            {
                market_id: 35,
                country: 'SE',
                name: 'NDX Sweden'
            },

            {
                market_id: 24,
                country: 'FI',
                name: 'Nasdaq OMX Helsinki'
            },

            {
                market_id: 17,
                country: 'US',
                name: 'New York Stock Exchange'
            },

            {
                market_id: 34,
                country: 'NO',
                name: 'Sola'
            }, {
                market_id: 115,
                country: 'DE',
                name: 'EUREX'
            }, {
                market_id: 13,
                country: 'SE',
                name: 'NGM'
            },

            {
                market_id: 42,
                country: 'FI',
                name: 'Saxess FI SOX'
            },

            {
                market_id: 19,
                country: 'US',
                name: 'Nasdaq'
            },

            {
                market_id: 11,
                country: 'SE',
                name: 'Nasdaq OMX Stockholm'
            },

            {
                market_id: 4,
                country: 'DE',
                name: 'Xetra'
            },

            {
                market_id: 15,
                country: 'NO',
                name: 'Millennium OSE'
            },

            {
                market_id: 37,
                country: 'NO',
                name: 'NDX Norway'
            }, {
                market_id: 36,
                country: 'FI',
                name: 'NDX Finland'
            }, {
                market_id: 18,
                country: 'US',
                name: 'American Stock Exchange'
            },

            {
                market_id: 25,
                country: 'CA',
                name: 'Toronto Stock Exchange'
            },

            {
                market_id: 32,
                country: 'DK',
                name: 'Burgundy Denmark'
            },

            {
                market_id: 21,
                country: 'US',
                name: 'Nasdaq OTC Foreign'
            },

            {
                market_id: 20,
                country: 'US',
                name: 'Nasdaq OTC Domestic'
            }
        ]
    }
}

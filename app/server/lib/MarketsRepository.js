MarketsRepository = class {
    constructor() {
        if (Markets.find().count() == 0)
            markets.forEach((market) => {
                Markets.upsert({
                    market_id: market.market_id
                }, {
                    $set: market
                })
            })
    }

    getMarkets(countryCode) {
    	return Markets.find({country : countryCode}).map(x => x);
    }
}

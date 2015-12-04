SharevilleInstrumentRepository = class {
	constructor() {
		this.url = 'https://www.shareville.se/api/v1/marketflow/instruments/stocks/popular?instrument_type=ESH&period=m1&rating=3'
	}

    getInstruments() {
    	var res = HTTP.get(this.url).data;
    	res = res.results.map(item => {
    		delete item.org_info;

    		return item;
    	})

        //Cert
        res = res.filter(x => x.name.indexOf("Genmab") != -1)
    	return res;
    }
}


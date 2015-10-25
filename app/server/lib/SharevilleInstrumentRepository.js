SharevilleInstrumentRepository = class {
	constructor() {
		this.url = 'https://www.shareville.se/api/v1/marketflow/instruments/stocks/popular?instrument_type=ESH&period=m1&rating=3'
	}
    getInstrument() {
        return {
            name: 'Novo Nordisk B A/S',
            country: 'DK',
            instrument_id: 16256554,
            symbol : 'NOVO B',
            isin_code : 'DK0060534915'
        }
    }

    getInstruments() {
    	var res = HTTP.get(this.url).data;
    	res = res.results.map(item => {
    		delete item.org_info;

    		return item;
    	})
    	return res;
    }
}
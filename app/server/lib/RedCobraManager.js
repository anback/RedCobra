RedCobraManager = class {
	constructor(sharevilleInstrumentRepository, nextApiHandler) {
		this.sharevilleInstrumentRepository = sharevilleInstrumentRepository;
		this.nextApiHandler = nextApiHandler;
		this.weightIntervals = [];
		this.weightIntervals.push(new WeightInterval(0, 7.5, 5))
		this.weightIntervals.push(new WeightInterval(0, 7.5, 5))
		this.weightIntervals.push(new WeightInterval(0, 7.5, 5))
		this.weightIntervals.push(new WeightInterval(7.5, 12.5))
		this.weightIntervals.push(new WeightInterval(7.5, 12.5))
		this.weightIntervals.push(new WeightInterval(7.5, 12.5))
		this.weightIntervals.push(new WeightInterval(7.5, 12.5))
		this.weightIntervals.push(new WeightInterval(12.5, 17.5))
		this.weightIntervals.push(new WeightInterval(12.5, 17.5))
		this.weightIntervals.push(new WeightInterval(12.5, 17.5))
	}

	getSellOrder(position) {
		var sharevilleInstrument = this.sharevilleInstruments[position.instrument.identifier]

			if(!sharevilleInstrument) //Sell all
				return new Order(sharevilleInstrument.nextInstrument, 
					this.nextApiHandler.getPrice(sharevilleInstrument.nextInstrument),
					'sell', position.qty)

			var currentWeight = parseFloat(position.marketValue) / parseFloat(this.accountSum);
			var currentWeightDiff = sharevilleInstrument.weightInterval.getWeightDiff(currentWeight);
			console.log(currentWeight);

			//Is in allowed weight internval
			if(sharevilleInstrument.weightInterval.isInOrBelowInterval(currentWeight))
				return;

			//is not in current weight interval, genereate sell order that corresponds to diff
			var qty = currentWeightDiff / 100 * this.accountSum;
			return new Order(sharevilleInstrument.nextInstrument, 
					this.nextApiHandler.getPrice(sharevilleInstrument.nextInstrument),
					'sell', qty)
	}

	syncAccount() {
		//Get Shareville Instruments
		var sharevilleInstruments = this.sharevilleInstrumentRepository.getInstruments();
		sharevilleInstruments = sharevilleInstruments.map(item => {
			var instrument = this.nextApiHandler.getInstrument(item);
			return {
				symbol : item.symbol,
				weightInterval : this.weightIntervals.pop(),
				instrument_id : instrument.instrument_id,
				nextInstrument : instrument
			}
		})

		//Get Nordnet Instruments
		var positions = this.nextApiHandler.getAccountPositions().positions.position;
		var account = this.nextApiHandler.getAccount();
		this.accountSum = account.account_sum.value;
		this.sharevilleInstruments = Util.toObject(sharevilleInstruments, 'instrument_id')


		var sellOrders = positions.map((position) => {
			return this.getSellOrder(position)
		})

		console.log(sellOrders);
		
		//Först sälja
		//nordnet deposit weight är i intervall => gör inget
		//nordnet deposit weight är not in intervall => sälj få ner den till mitten


		//Sen köpa
		//nu har du pengar på kontot, dags att köpa, köp i de som ligger sämst till ochse till och 
		//fylla dom.


	}
}
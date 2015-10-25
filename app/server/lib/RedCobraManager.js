RedCobraManager = class {
	constructor(sharevilleInstrumentRepository, nextApiHandler) {
		this.sharevilleInstrumentRepository = sharevilleInstrumentRepository;
		this.nextApiHandler = nextApiHandler;
		this.weightIntervals = [];
		this.weightIntervals.push(new WeightInterval(0, 7.5))
		this.weightIntervals.push(new WeightInterval(0, 7.5))
		this.weightIntervals.push(new WeightInterval(0, 7.5))
		this.weightIntervals.push(new WeightInterval(7.5, 12.5))
		this.weightIntervals.push(new WeightInterval(7.5, 12.5))
		this.weightIntervals.push(new WeightInterval(7.5, 12.5))
		this.weightIntervals.push(new WeightInterval(7.5, 12.5))
		this.weightIntervals.push(new WeightInterval(12.5, 17.5))
		this.weightIntervals.push(new WeightInterval(12.5, 17.5))
		this.weightIntervals.push(new WeightInterval(12.5, 17.5))
	}

	syncAccount() {
		//Get Shareville Instruments
		var sharevilleInstruments = this.sharevilleInstrumentRepository.getInstruments();
		sharevilleInstruments = sharevilleInstruments.map(item => {
			return {
				symbol : item.symbol,
				instrument : this.nextApiHandler.getInstrument(item),
				weightInterval : this.weightIntervals.pop()
			}
		})

		//console.log(sharevilleInstruments);

		//Get Nordnet Instruments
		var positions = this.nextApiHandler.getAccountPositions().positions.position;
		var account = this.nextApiHandler.getAccount();
		var accountSum = account.accountSum;

		console.log(sharevilleInstruments);


		
		//Först sälja
		//nordnet deposit weight är i intervall => gör inget



		//nordnet deposit weight är not in intervall => sälj få ner den till mitten


		//Sen köpa
		//nu har du pengar på kontot, dags att köpa, köp i de som ligger sämst till ochse till och 
		//fylla dom.


	}
}
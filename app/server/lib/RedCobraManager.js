RedCobraManager = class {
    constructor(sharevilleInstrumentRepository, nextApiHandler) {
        this.sharevilleInstrumentRepository = sharevilleInstrumentRepository;
        this.nextApiHandler = nextApiHandler;
        this.weightIntervals = [];
        this.weightIntervals.push(new WeightInterval(0, 0.075, 0.05))
        this.weightIntervals.push(new WeightInterval(0, 0.075, 0.05))
        this.weightIntervals.push(new WeightInterval(0, 0.075, 0.05))
        this.weightIntervals.push(new WeightInterval(0.075, 0.125))
        this.weightIntervals.push(new WeightInterval(0.075, 0.0125))
        this.weightIntervals.push(new WeightInterval(0.075, 0.0125))
        this.weightIntervals.push(new WeightInterval(0.075, 0.0125))
        this.weightIntervals.push(new WeightInterval(0.125, 0.175))
        this.weightIntervals.push(new WeightInterval(0.125, 0.175))
        this.weightIntervals.push(new WeightInterval(0.125, 0.175))
    }

    getSellOrder(position, accountSum, sharevilleInstruments) {
        var sharevilleInstrument = sharevilleInstruments[position.instrument.identifier]

        if (!sharevilleInstrument) //Sell all
            return new Order(sharevilleInstrument.nextInstrument,
            this.nextApiHandler.getPrice(sharevilleInstrument.nextInstrument),
            'sell', position.qty)

        var currentWeight = parseFloat(position.marketValue) / parseFloat(accountSum);
        var currentWeightDiff = sharevilleInstrument.weightInterval.getWeightDiff(currentWeight);
        console.log(currentWeight);

        //Is in allowed weight internval
        if (sharevilleInstrument.weightInterval.isInOrBelowInterval(currentWeight))
            return;

        //is not in current weight interval, genereate sell order that corresponds to diff
        var qty = currentWeightDiff / 100 * accountSum;
        return new Order(sharevilleInstrument.nextInstrument,
            this.nextApiHandler.getPrice(sharevilleInstrument.nextInstrument),
            'sell', qty)
    }

    getBuyOrders(position, accountSum, sharevilleInstruments) {
        var sharevilleInstrument = sharevilleInstruments[position.instrument.identifier]
    }

    getPopularInstruments() {
        var res = this.sharevilleInstrumentRepository.getInstruments();
        res = res.sort(function(a,b) {return a.occurence_prc - b.occurence_prc})
        res = res.map((item,index) => {
            var instrument = this.nextApiHandler.getInstrument(item);
            return {
                symbol: item.symbol,
                weightInterval: this.weightIntervals[index],
                instrument_id: instrument.instrument_id,
                occurence_prc : item.occurence_prc,
                nextInstrument: instrument
            }
        })

        return res;
    }

    handleBuyProcess() {
        if(this.hasPendingOrders())
            throw new Error("Some orders where still pending")
        //Get Shareville Instruments
        var sharevilleInstruments = this.getPopularInstruments();

        //Get Nordnet Instruments
        var positions = this.nextApiHandler.getAccountPositions();

        var account = this.nextApiHandler.getAccount();
        var accountSum = account.account_sum.value;
        sharevilleInstruments = Util.toObject(sharevilleInstruments, 'instrument_id')

        var buyOrders = positions.map((position) => this.getBuyOrders(position, accountSum, sharevilleInstruments))
    }


    handleSellProcess() {
        //Get Shareville Instruments
        var sharevilleInstruments = this.getPopularInstruments();
        console.log(sharevilleInstruments);

        //Get Nordnet Instruments
        var positions = this.nextApiHandler.getAccountPositions();

        if(!positions)
        	return;

        var account = this.nextApiHandler.getAccount();
        var accountSum = account.account_sum.value;
        sharevilleInstruments = Util.toObject(sharevilleInstruments, 'instrument_id')

        var sellOrders = positions.map((position) => this.getSellOrder(position, accountSum, sharevilleInstruments))

        //Execute Sell Orders towarrd Nordnet
        sellOrders.forEach((order) => this.nextApiHandler.sendOrder(order));

        console.log(this.hasPendingSellOrders())
    }

    hasPendingOrders() {
    	var orders = this.nextApiHandler.getOrders();

        if(!orders)
            return false;

        if(orders.some(order => order.actionState != 'SUCCESS'))
            return true

        return false;
    }
}
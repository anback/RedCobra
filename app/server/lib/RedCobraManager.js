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

    getPopularInstruments() {
        var res = this.sharevilleInstrumentRepository.getInstruments();
        res = res.sort(function(a, b) {
            return a.occurence_prc - b.occurence_prc
        })
        res = res.map((item, index) => {
            var instrument = this.nextApiHandler.getInstrument(item);
            return {
                symbol: item.symbol,
                weightInterval: this.weightIntervals[index],
                instrument_id: instrument.instrument_id,
                occurence_prc: item.occurence_prc,
                instrument: instrument
            }
        })

        return res;
    }

    getSellOrder(position, account, sharevilleInstruments) {
        var sharevilleInstrument = sharevilleInstruments[position.instrument.identifier]
        var price = this.nextApiHandler.getPrice(sharevilleInstrument.instrument)

        if (!sharevilleInstrument) //Sell all
            return new Order(sharevilleInstrument.instrument, price, 'sell', position.qty)

        var currentWeight = parseFloat(position.marketValue) / parseFloat(account.getTotalValue());
        var currentWeightDiff = sharevilleInstrument.weightInterval.getWeightDiff(currentWeight);
        console.log(currentWeight);

        //Is in allowed weight internval
        if (sharevilleInstrument.weightInterval.isInOrBelowInterval(currentWeight))
            return;

        //is not in current weight interval, genereate sell order that corresponds to diff
        var volume = currentWeightDiff / 100 * account.getTotalValue();
        return new Order(sharevilleInstrument.instrument, price, 'sell', volume);
    }

    getBuyOrder(sharevilleInstrument, account, positions) {
        var position = positions[sharevilleInstrument.instrument.instrument_id];
        var fullMarketvalue = account.fullMarketValue;
        var price = this.nextApiHandler.getPrice(sharevilleInstrument.instrument)

        if (!position)
            position = {
                instrument: sharevilleInstrument.instrument,
                marketValue: 0,

            };

        var currentWeight = parseFloat(position.marketValue) / parseFloat(fullMarketvalue);
        var currentWeightDiff = sharevilleInstrument.weightInterval.getWeightDiff(currentWeight);
        var volume = Util.roof(fullMarketvalue * currentWeightDiff / price, account.availableMoney / price)

        if (volume == 0)
            return undefined;

        return new Order(sharevilleInstrument.instrument, price, 'buy', volume)
    }

    handleBuyProcess() {
        if (this.hasPendingOrders())
            throw new Error("Some orders where still pending")
            //Get Shareville Instruments
        var sharevilleInstruments = this.getPopularInstruments();

        //Get Nordnet Instruments
        var positions = this.nextApiHandler.getAccountPositions();

        if (!positions)
            positions = [];

        positions = positions.map(position => {
            return {
                instrument_id: position.instrument.identifier,
                marketValue: position.marketValue,
                currency: position.currency
            }
        })

        positions = Util.toObject(positions, 'instrument_id')
        var account = this.nextApiHandler.getAccount();
        var availableMoney = account.accountSum;
        var buyOrders = [];
        sharevilleInstruments.reduce((availableMoney, sharevilleInstrument) => {
            account.availableMoney = availableMoney;
            var order = this.getBuyOrder(sharevilleInstrument, account, positions)

            if (order)
                buyOrders.push(order);

            return order.getTotalValue() - availableMoney;
        }, availableMoney)

        buyOrders.forEach(order => this.nextApiHandler.sendOrder(order));
    }

    handleSellProcess() {
        //Get Shareville Instruments
        var sharevilleInstruments = this.getPopularInstruments();

        //Get Nordnet Instruments
        var positions = this.nextApiHandler.getAccountPositions();

        if (!positions)
            return;

        var account = this.nextApiHandler.getAccount();
        sharevilleInstruments = Util.toObject(sharevilleInstruments, 'instrument_id')

        var sellOrders = positions.map((position) => this.getSellOrder(position, account, sharevilleInstruments))

        //Execute Sell Orders towarrd Nordnet
        sellOrders.forEach((order) => this.nextApiHandler.sendOrder(order));
    }

    hasPendingOrders() {
        var orders = this.nextApiHandler.getOrders();

        if (!orders)
            return false;

        if (orders.some(order => order.actionState != 'SUCCESS'))
            return true

        return false;
    }
}

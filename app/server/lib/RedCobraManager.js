RedCobraManager = class {
    constructor(sharevilleInstrumentRepository, nextApiHandler) {
        this.sharevilleInstrumentRepository = sharevilleInstrumentRepository;
        this.nextApiHandler = nextApiHandler;
        this.weightIntervals = WeightInterval.getIntervals();
    }

    getPopularInstruments() {
        var res = this.sharevilleInstrumentRepository.getInstruments();
        res = res.sort(function(a, b) {
            return a.occurence_prc - b.occurence_prc
        })
        res = res.map((item, index) => {
            var instrument = this.nextApiHandler.getInstrument(item);

            if(!instrument)
                return;
            return {
                symbol: item.symbol,
                weightInterval: this.weightIntervals[index],
                instrument_id: instrument.instrument_id,
                occurence_prc: item.occurence_prc,
                instrument: instrument
            }
        }).filter(x => x != undefined);

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

    deleteAllOrders() {
        var orders = this.nextApiHandler.getOrders();
        if(orders)
            orders.forEach(order => {
                this.nextApiHandler.deleteOrder(order);
            })
    }

    getBuyOrder(sharevilleInstrument, account, positions) {
        var position = positions[sharevilleInstrument.instrument.instrument_id];
        var totalValue = account.getTotalValue();
        var price = this.nextApiHandler.getPrice(sharevilleInstrument.instrument)

        if (!position)
            position = {
                instrument: sharevilleInstrument.instrument,
                marketValue: 0,

            };

        var currentWeight = parseFloat(position.marketValue) / parseFloat(totalValue);
        var currentWeightDiff = sharevilleInstrument.weightInterval.getWeightDiff(currentWeight);
        var volume = Util.roof(totalValue * currentWeightDiff / price, account.availableMoney / price)

        if (volume == 0)
            return undefined;

        return new Order(sharevilleInstrument.instrument, price, 'buy', volume)
    }

    syncPortfolio() {
        this.handleSellProcess();
        this.handleBuyProcess();
    }

    handleBuyProcess() {
        if (this.hasPendingOrders())
            throw new Error("Some orders where still pending")
            //Get Shareville Instruments
        var sharevilleInstruments = this.getPopularInstruments();

        //Get Nordnet Instruments
        var positions = this.nextApiHandler.getAccountPositions();

        if (!Array.isArray(positions))
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

            return availableMoney - order.getTotalValue();
        }, availableMoney)

        buyOrders.forEach(order => this.nextApiHandler.sendOrder(order));
    }

    handleSellProcess() {
        //Get Shareville Instruments
        var sharevilleInstruments = this.getPopularInstruments();

        //Get Nordnet Instruments
        var positions = this.nextApiHandler.getAccountPositions();

        if (!Array.isArray(positions))
            return;

        var account = this.nextApiHandler.getAccount();
        sharevilleInstruments = Util.toObject(sharevilleInstruments, 'instrument_id')

        var sellOrders = positions.map((position) => this.getSellOrder(position, account, sharevilleInstruments))

        //Execute Sell Orders towarrd Nordnet
        sellOrders.forEach((order) => this.nextApiHandler.sendOrder(order));
    }

    hasPendingOrders() {
        var orders = this.nextApiHandler.getOrders();

        if (Array.isArray(orders) && orders.some(order => order.actionState != 'SUCCESS'))
            return true

        return false;
    }
}

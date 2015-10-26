Meteor.startup(function() {
    var marketsRepository = new MarketsRepository();
    var nextApiHandler = new NextApiHandler(marketsRepository)
    var sharevilleInstrumentRepository = new SharevilleInstrumentRepository();
    var redCobraManager = new RedCobraManager(sharevilleInstrumentRepository, nextApiHandler);

    nextApiHandler.sendOrder = function(order) {
        order.name = order.instrument.name;
        delete order.instrument;
        console.log(order)
    }

    nextApiHandler.getPrice = function() {
        return 57.0
    }

    redCobraManager.handleSellProcess();
    redCobraManager.handleBuyProcess();
});


//Vad är nästa mål, joo men att typ givet en nordnet 
// kunna hämta hem lite kurse och köra, portfölj

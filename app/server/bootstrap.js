Meteor.startup(function() {
    var marketsRepository = new MarketsRepository();
    var nextApiHandlerMock = new NextApiHandler(marketsRepository)
    var sharevilleInstrumentRepository = new SharevilleInstrumentRepository();
    var redCobraManager = new RedCobraManager(sharevilleInstrumentRepository, nextApiHandlerMock);

    nextApiHandlerMock.sendOrder = function(order) {
        order.name = order.instrument.name;
        delete order.instrument;
        console.log(order)
    }

    nextApiHandlerMock.getPrice = function() {
        return 57.0
    }

    redCobraManager.handleSellProcess();
    redCobraManager.handleBuyProcess();
});


//Vad är nästa mål, joo men att typ givet en nordnet 
// kunna hämta hem lite kurse och köra, portfölj
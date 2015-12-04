Meteor.startup(function() {
    var nextApiHandler = new NextApiHandler()
    var marketsRepository = new MarketsRepository(nextApiHandler);
    var nextApiHandler = new NextApiHandler(marketsRepository)
    var sharevilleInstrumentRepository = new SharevilleInstrumentRepository();
    var redCobraManager = new RedCobraManager(sharevilleInstrumentRepository, nextApiHandler);

    //nextApiHandler.sendOrder = function(order) {
    //    order.name = order.instrument.name;
    //    delete order.instrument;
    //    console.log(order)
    //}

    /* Dont touch
    redCobraManager.handleSellProcess();
    */

    nextApiHandler.getPrice = function() {
        return 662
    }
    
    //redCobraManager.handleBuyProcess();
    //nextApiHandler.updateOrder(909515, 86)
    redCobraManager.deleteAllOrders();


    console.log("getOrders");
    console.log(nextApiHandler.getOrders());

    /*
    console.log("getAccount");
    console.log(nextApiHandler.getAccount());

    console.log("getAccountPositions");
    console.log(nextApiHandler.getAccountPositions());
    */
});
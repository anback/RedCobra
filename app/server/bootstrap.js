Meteor.startup(function () {
	var marketsRepository = new MarketsRepository();
	var nextApiHandler = new NextApiHandler(marketsRepository)
	var sharevilleInstrumentRepository = new SharevilleInstrumentRepository();
	var redCobraManager = new RedCobraManager(sharevilleInstrumentRepository, nextApiHandler);
	redCobraManager.syncAccount();
});


//Vad är nästa mål, joo men att typ givet en nordnet 
// kunna hämta hem lite kurse och köra, portfölj 
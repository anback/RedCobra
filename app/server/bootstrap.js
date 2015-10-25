Meteor.startup(function () {
	var marketsRepository = new MarketsRepository();
	var nextApiHandler = new NextApiHandler(marketsRepository)
	var sharevilleInstrumentRepository = new SharevilleInstrumentRepository();

	var sharevilleInstrument = sharevilleInstrumentRepository.getInstrument()
	var instrument = nextApiHandler.getInstrument(sharevilleInstrument)

	console.log("isntrument")
	console.log(instrument);

	var price = nextApiHandler.getPrice(instrument);
	console.log(price);
});

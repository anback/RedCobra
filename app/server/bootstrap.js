Meteor.startup(function () {
	var marketsRepository = new MarketsRepository();
	var nextApiHandler = new NextApiHandler(marketsRepository)
	var sharevilleInstrumentRepository = new SharevilleInstrumentRepository();

	//console.log('Session Key: ')
	//console.log(nextApiHandler.session.session_key);

	console.log(nextApiHandler.getInstrument(sharevilleInstrumentRepository.getInstrument()));
});

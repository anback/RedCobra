Meteor.startup(function () {
	var nextApiHandler = new NextApiHandler()
	console.log('Session Key: ')
	console.log(nextApiHandler.session.session_key);

	console.log("Get Accounts: ")
	console.log(nextApiHandler.getAccounts() );
});

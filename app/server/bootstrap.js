Meteor.startup(function () {
	var nextApiHandler = new NextApiHandler()
	console.log(nextApiHandler.session);
});

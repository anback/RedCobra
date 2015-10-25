OrderRepository = class {
	constructor(nordnetPlanInfo) {
		this.nordnetPlan = nordnetPlanInfo
	}

	saveOrder(order) {
		order.commission = order.volume * order.price * nordnetPlanInfo.commission;
		Orders.insert(order);
	}
}
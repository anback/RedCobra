Account = class {
	constructor(accountSum, fullMarketValue, accountCurrency, tradingPower) {
		this.fullMarketValue = fullMarketValue
		this.accountSum = accountSum
		this.accountCurrency = accountCurrency
		this.tradingPower = tradingPower
	}

	getTotalValue() {
		return this.fullMarketValue + this.accounSum; //stocks value + available money
	}
}
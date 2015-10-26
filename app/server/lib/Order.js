Order = class {
	constructor(instrument, price, side, volume) {
		this.instrument = instrument;
		this.price = price;
		this.side = side;
		this.volume = volume;
	}

	save() {
		Orders.insert(this);
	}

	getTotalValue() {
		return this.price * this.volume;
	}
}
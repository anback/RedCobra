Order = class {
	constructor(instrument, price, side, volume) {
		this.instrument = instrument;
		this.price = price;
		this.side = side;
		this.order_type = orderType; //FAK, FOK, NORMAL
		this.volume = volume;
	}
}
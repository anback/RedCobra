WeightInterval = class {
	constructor(min, max, mean) {
		this.min = min;
		this.max = max;

		if(!mean)
			this.mean = (max + min) / 2
		else
			this.mean = mean
	}

	isInInterval(weight) {
		return weight >= this.min && weight < this.max 
	}

	isInOrBelowInterval(weight) {
		return weight < this.max;
	}

	getWeightDiff(weight) {
		return (weight - this.mean);
	}
}
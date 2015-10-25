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
		weight = weight * 100;
		return weight >= this.min && weight < this.max 
	}

	isInOrBelowInterval(weight) {
		weight = weight * 100;
		return weight < this.max;
	}

	getWeightDiff(weight) {
		weight = weight * 100;
		return (weight - this.mean) / 100;
	}
}
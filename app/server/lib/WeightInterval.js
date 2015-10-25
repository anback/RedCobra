WeightInterval = class {
	constructor(min, max) {
		this.min = min;
		this.max = max;
		this.mean = (max + min)/2;
	}

	isInInterval(weight) {
		return weight >= min && weight < max 
	}

	getWeightDiff(weight) {
		return weight - mean;
	}
}
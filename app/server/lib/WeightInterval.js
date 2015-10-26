WeightInterval = class {
	constructor(min, max, mean) {
		this.min = min;
		this.max = max;

		if(!mean)
			this.mean = (max + min) / 2
		else
			this.mean = mean
	}

	static getIntervals() {
		let weightIntervals = [];
        weightIntervals.push(new WeightInterval(0, 0.075, 0.05))
        weightIntervals.push(new WeightInterval(0, 0.075, 0.05))
        weightIntervals.push(new WeightInterval(0, 0.075, 0.05))
        weightIntervals.push(new WeightInterval(0.075, 0.125))
        weightIntervals.push(new WeightInterval(0.075, 0.0125))
        weightIntervals.push(new WeightInterval(0.075, 0.0125))
        weightIntervals.push(new WeightInterval(0.075, 0.0125))
        weightIntervals.push(new WeightInterval(0.125, 0.175))
        weightIntervals.push(new WeightInterval(0.125, 0.175))
        weightIntervals.push(new WeightInterval(0.125, 0.175))

        return weightIntervals;
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
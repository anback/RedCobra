Util = class {
	static toArray(obj) {
		var res = []
		for(key in obj) {
			res.push({
				key : key,
				value : obj[key]
			})
		}

		return res;
	}
}
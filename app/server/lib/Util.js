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

	static toObject(array, uniqueIdFieldName) {

        let rv = {};
        for (var i = 0; i < array.length; ++i) {
            let item = array[i];
            rv[item[uniqueIdFieldName]] = item;
        }

        return rv;
    }
}
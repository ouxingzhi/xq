/**
 * xQ framework data module
 */

;!function(window,document,xq){
	var cache = {};

	function getIdentity(el){
		return el[xq.identification] ? el[xq.identification] : (el[xq.identification] = xq.identity());
	}
	function getData(el,name){
		var id = getIdentity(el);
		cache[id] = cache[id] || {};
		return cache[id][name] || null;
	}

	function addData(el,name,value){
		var id = getIdentity(el);
		cache[id] = cache[id] || {};
		cache[id][name] = value;
	}
	function removeData(el,name){
		var id = getIdentity(el);
		cache[id] = cache[id] || {};
		if(name){
			delete cache[id][name];
		}else{
			delete cache[id];
		}
	}
	xq.extend({
		data:function(el,name,value){
			if(value){
				addData(el,name,value);
			}else{
				return getData(el,name);
			}
		},
		removeData:removeData
	});
	xq.fn.extend({
		/**
		 * 给元素对象设置数据，value不传则为取数据
		 * @method data
		 * @param name {any} 设置或读取的数据名
		 * @param value {any} 保存的数据
		 * @return {xq|any} 设置数据返回的是xq对象，读取数据则返回数据本身
		 */
		data:function(name,value){
			if(value){
				this.each(function(el){
					addData(el,name,value);
				})
				return this;
			}else{
				if(!this.length) return null;
				if(this.length === 1) return getData(el,name);
				var res = [];
				this.each(function(el){
					res.push(getData(el,name));
				});
				return res;
			}
		},
		/**
		 * 删除当前元素对象的数据
		 * @method data
		 * @param name {any} 删除数据的名称
		 * @return {xq} 返回的是xq对象
		 */
		removeData:function(name){
			this.each(function(el){
				removeData(el,name);
			});
			return this;
		}
	});
}(window,document,xq);
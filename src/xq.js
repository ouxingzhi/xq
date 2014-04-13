;!function(window,document,undefined){
	var protoString = Object.prototype.toString,
		ap = Array.prototype,
		push = ap.push,
		slice = ap.slice,
		splice = ap.splice,
		Type = function(o){
			return protoString.call(o);
		};

	function each(source,handler,args){
		var i;
		if(!source) return this;
		if(typeof handler !== 'function') return this;
		args = args || [];
		if(Type(source) === '[object Array]'){
			for(i=0;i<source.length;i++){
				if(handler.apply(source[i],args.concat(source[i],i,source))) return;
			}
		}else if(Type(source) === '[object Object]'){
			for(i in source){
				if(!source.hasOwnProperty(i)) continue;
				if(handler.apply(source[i],args.concat(source[i],i,source))) return;
			}
		}
		return this;
	}

	each("Object Function Array String Number Boolean Date RegExp Null Undefined".split(" "),function(val,i){
		xq['is'+val] = function(o){
			return Type(o).toLowerCase() === ('[object '+val+']').toLowerCase();
		};
	});
	xq.isArguments = function(o){
		var t = Type(o).toLowerCase();
		return t === '[object arguments]' || t === '[object object]' && o.callee && 'length' in o;
	}
	each("Document Element Attr".split(" "),function(val,i){
		xq['is'+val] = function(o){
			return Type(o).toLowerCase().indexOf(val.toLowerCase()) > -1;
		};
	});
	var tagreg = /^<([^<>]+)>$/i,
		htmlreg = /^<([^<>]+)>.*?<\/\1>$/i,
		trimreg = /^\s+|\s+$/mg,
		//对象是否存在__proto__属性
		existProto = '__proto__' in {};
	/**
	 * xq构造器，第一个参数可传入字符串，函数，传入字符串会判断是html，还是css选择器，查找或生成对应节点。
	 *
	 * @class xq
	 * @constructor
	 * @param {String|DOM|Function} selection 传入的css选择器或是html字符串或是function，function会自动加入DOMContentLoaded 
	 * @param {node} content 要查找根节点
	 */
	function xq(selection,content){
		return new xq.fn.init(selection,content);
	}
	/**
	 * xq的原生对象，可对此对象添加方法来扩展xq
	 * @property fn
	 * @type object
	 * @static
	 */
	xq.fn = xq.prototype = {
		constructor:xq,
		length:0,
		init:function(selection,content){
			this.content = content;
			if(xq.isString(selection)){
				selection = xq.trim(selection);
				if(tagreg.exec(selection)){
					selection = document.createElement(RegExp.$1);
					this.push(selection);
				}else if(htmlreg.test(selection)){
					var tmp = document.createElement('div');
					tmp.innerHTML = selection;
					ap.push.apply(this,tmp.childNodes);
				}else{
					var result = oQuery(selection,content);
					return existProto ? (result.__proto__ = xq.fn,result.content = content,result) : (push.apply(this,result),this);
				}

			}else if(xq.isElement(selection)){
				this.push(selection);
			}else if(xq.isFunction(selection)){
				xq.ready(selection);
			}else if(selection instanceof xq){
				return selection.slice();
			}
		},
		/**
		 * 遍历所有元素
		 *
		 * @method each
		 * @param handler {Function} 处理函数
		 * @param [args] {Array} 传入处理函数的参数
		 * @return void
		 */
		each:function(handler,args){
			if(!handler) return this;
			args = args || [];
			for(var i=0;i<this.length;i++){
				if(handler.apply(this[i],args.concat(this[i],i,this))) return;
			}
		},
		/**
		 * 遍历所有的元素，并返回所有处理函数返回的结果
		 * @method map
		 * @param handler {Function} 处理函数
		 * @return {xq} 返回xq对象
		 */
		map:function(handler){
			var result = xq();
			this.each(function(val,i,s){
				push.apply(result,[].concat(handler.call(this,val,i,s)));
			});
			return result;
		},
		/**
		 * 取当前xq对象中某段元素
		 * @method slice
		 * @param pos {Number} 要取数组中的开始的位置
		 * @papam [length] {Number} 要取的长度
		 * @return {xq} 返回结果
		 */
		slice:function(){
			var tmp = xq();
			push.apply(tmp,slice.apply(this,arguments));
			return tmp;
		},
		/**
		 * 取i指定的索引的元素，返回为xq对象
		 * @methoc eq
		 * @param i {Number} 要取的索引值
		 * @return {xq} 返回i索引值所在的元素
		 */
		eq:function(i){
			if(i<0 && this.length+i < 0 || i>0 && i>=this.length) return null;
			return xq(i < 0 ? this[this.length-1] : this[i]);
		},
		/**
		 * 取xq对象中第一个元素
		 * @method first
		 * @return {xq}
		 */
		first:function(){
			return this.eq(0);
		},
		/**
		 * 取xq对象中最后一个元素
		 * @method last
		 * @return {xq}
		 */
		last:function(){
			return this.eq(-1);
		},
		/**
		 * 取index位的原生元素
		 * @method get
		 * @return {Element}
		 */
		get:function(index){
			if(isNaN(index)) return null;
			index = index < 0 ? this.length - index : index;
			return this[index];
		},
		/**
		 * 获得当前元素的在父元素中的位置
		 * @method index
		 * @param el {Element}
		 * @return {Number} 元素的索引值
		 */
		index:function(el){
			el = el instanceof xq && el[0] || this[0];
			var i = 0;
			if(!el) return i;
			while(el = el.previousSibling){
				if(el.nodeType === 1) i++;
			}
			return i;
		},
		/**
		 * 返回el元素在当前xq对象的位置，from作为查找的开始位置
		 * @method indexOf 
		 * @param el {Element} 传入的el
		 * @param from {Number} 传入的开始位置
		 * @return {Number} 返回索引值，如果未找到，则返回-1
		 */
		indexOf:ap.indexOf || function(el,from){
			var from = from || 0;
			for(var i=from,len=this.length;i<len;i++){
				if(this[i] === el) return i;
			}
			return -1;
		},
		/**
		 * 返回当前xq对象最后一个元素
		 * @method end
		 * @return {xq}
		 */
		end:function(){
			return this.last();
		},
		/**
		 * 压入元素
		 * @method push
		 * @param el* {Element} 要压入的元素
		 */
		push:push,
		/**
		 * 排序方法
		 * @method sort
		 * @param handler {Function} 自定义排序函数
		 * @return {xq} 返回本身的xq对象
		 */
		sort:ap.sort,
		/**
		 * 剪切当前xq对象中某段元素并返回
		 * @method splice
		 * @param index {Number} 要裁剪的开始位置
		 * @param [length] {Number} 要裁剪的长度
		 * @return {xq} 返回结果的xq对象
 		 */
		splice:function(){
			var tmp = xq();
			push.apply(tmp,splice.apply(this,arguments));
			return tmp;
		}

	};

	xq.fn.extend = xq.extend = function(ret,obj){
		var args = arguments;
		if(args.length === 0) return this;
		if(args.length === 1){
			obj = ret;
			ret = this;
		}
		each(obj,function(val,i){
			ret[i] = val;
		});
		return ret;
	};
	xq.fn.init.prototype = xq.fn;
	var _xq = window.xq,_$ = window.$;
	xq.extend({
		/**
		 * 归还占有的全局xq变量，返回xq对象
		 * @method noConfict
		 * @return {xq} 
		 * @static
		 */
		noConfict:function(){
			window.xq = _xq;
			window.$ = _$;
			return xq;
		},
		/**
		 * 改变函数执行上下文
		 * @method proxy
		 * @param fun {Function} 要改变上下文的函数
		 * @param object {Object} 上下文对象
		 * @param [args] {Array} 要入函数的额外参数
		 * @return {Function} 返回函数
		 * @static
		 */
		proxy:function(fun,object,args){
			args = args || [];
			if(xq.isFunction(fun.bind)){
				return fun.bind.apply(fun,args);
			}else{
				return function(){
					fun.apply(object,args.concat(arguments));
				};
			}
		},
		/**
		 * 去除字符串头尾的空格字符串
		 * @method trim 
		 * @param str {String} 字符串
		 * @return {String} 被裁剪头尾空格的字符串
		 * @static
		 */
		trim:function(str){
			str += '';
			return str.trim ? str.trim() : str.replace(trimreg,'');
		},
		/**
		 * 对集合遍历处理
		 * @method each
		 * @param items {Object|Array} 要遍历的对象
		 * @param handler {Function} 处理函数
		 * @return void 
		 * @static
		 */
		each:each,
		/**
		 * 筛选集合对象
		 * @method grep
		 * @param items {Array|Object} 要筛选的对象
		 * @param handler {Function} 筛选函数
		 * @return {Array|Object} 返回筛选结果
		 * @static
		 */
		grep:function(items,handler){
			var result = xq.isArray(items) ? [] : {}; 
			each(items,function(v,i,l){
				if(handler(v,i,l)){
					result.push(v)
				}
			});
			return result;
		},
		/**
		 * 获得value在list中的索引值
		 * @method indexOf
		 * @param list {Array} 被查找的数组
		 * @param value {Any} 查找的元素
		 * @return {Number} 返回索引值
		 */
		indexOf:function(list,value){
			var index = -1;
			each(list,function(v,i){
				if(value === v){
					index = i;
					return true;
				}
			});
			return index;
		},
		/**
		 * 遍历集合，并返回合并后处理函数返回结果
		 * @method map
		 * @param list {Array} 要遍历的数组对象
		 * @param handler {Function} 处理函数
		 * @param [args] {Array} 传入参数
		 * @return {Array} 返回数组对象
		 * @static
		 */
		map:function(list,handler,args){
			var result = [];
			args = args || [];
			each(list,function(v,i,l){
				push.apply(result,[].concat(handler.apply(null,args.concat(arguments))));
			});
			return result;
		},
		/**
		 * 返回对象的类型
		 * @method type
		 * @param o {Any} 任何类型
		 * @return {String} 返回类型的字符串表示
		 * @static
		 */
		type:function(o){
			if(o === null) return 'null';
			if(o === undefined) return 'undefined';
			if(o && xq.isArguments(o)) return 'arguments';
			switch(Type(o).toLowerCase()){
				case '[object object]':
					return 'object';
				case '[object string]':
					return 'string';
				case '[object array]':
					return 'array';
				case '[object function]':
					return 'function';
				case '[object number]':
					return 'number';
				case '[object boolean]':
					return 'boolean';
				case '[object date]':
					return 'date';
				case '[object error]':
					return 'error';
				case '[object regexp]':
					return 'regexp';
				case '[object math]':
					return 'math';
			}
		},
		/**
		 * 对象转换为json字符串
		 * @method stringify 
		 * @param {Object} 对象
		 * @return {String} 返回json字符串
		 * @static
		 */
		stringify:typeof JSON !== 'undefined' && JSON.stringify && null || stringify,
		/**
		 * json字符串转换为Object
		 * @method parseJSON
		 * @param json {String} json字符串
		 * @return {Object} 返回Object
		 * @static 
		 */
		parseJSON:typeof JSON !== 'undefined' && JSON.parse || parse
	});
	window.xq = xq;
	function stringify(o){
		var t = xq.type(o),i,l,len;
		if(t === 'string') return '"'+o+'"';
		if(t === 'date') return 'new Date(' + o.getTime() + ')';
		if(t === 'regexp' || t === 'boolean' || t === 'number' || t === 'function') return o.toString();
		if(t === 'array'){
			l = [];
			for(i=0,len=o.length;i<len;i++){
				l.push(stringify(o[i]))
			}
			return '[' + l.join(',') + ']';
		}
		if(t === 'object'){
			l = [];
			for(i in o){
				if(o.hasOwnProperty(i))l.push('"' + i + '"' + ':' + stringify(o[i]))
			}
			return '{' + l.join(',') + '}';
		}
		if(t === 'unll' || t === 'undefined') return 'null';
		return null;
	}
	function parse(str){
		try{
			return (new Function('return ' + str))();
		}catch(e){
			return null;
		}
	}
}(window,document);





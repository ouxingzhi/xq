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
		existProto = '__proto__' in {}

	function xq(selection,content){
		return new xq.fn.init(selection,content);
	}

	xq.fn = xq.prototype = {
		constructor:xq,
		length:0,
		init:function(selection,content){
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
					return existProto ? (result.__proto__ = xq.fn,result) : (push.apply(this,result),this);
				}

			}else if(xq.isElement(selection)){
				this.push(selection);
			}else if(xq.isFunction(selection)){
				xq.ready(selection);
			}else if(selection instanceof xq){
				return selection.slice();
			}
		},
		each:function(handler,args){
			if(!handler) return this;
			args = args || [];
			for(var i=0;i<this.length;i++){
				if(handler.apply(this[i],args.concat(this[i],i,this))) return;
			}
		},
		map:function(handler){
			var result = xq();
			this.each(function(val,i,s){
				push.apply(result,[].concat(handler.call(this,val,i,s)));
			});
			return result;
		},
		slice:function(){
			var tmp = xq();
			push.apply(tmp,slice.apply(this,arguments));
			return tmp;
		},
		eq:function(i){
			if(i<0 && this.length+i < 0 || i>0 && i>=this.length) return null;
			return xq(i < 0 ? this[this.length-1] : this[i]);
		},
		first:function(){
			return this.eq(0);
		},
		last:function(){
			return this.eq(-1);
		},
		get:function(index){
			if(isNaN(index)) return null;
			index = index < 0 ? this.length - index : index;
			return this[index];
		},
		index:function(el){
			el = el || this[0];
			var i = 0;
			if(!el) return i;
			while(el = el.previousSibling){
				if(el.nodeType === 1) i++;
			}
			return i;
		},
		indexOf:ap.indexOf || function(el,from){
			var from = from || 0;
			for(var i=from,len=this.length;i<len;i++){
				if(this[i] === el) return i;
			}
			return -1;
		},
		end:function(){
			return this.last();
		},
		push:push,
		sort:ap.sort,
		splice:function(){
			var tmp = xq();
			push.apply(tmp,splice.apply(this,arguments));
			return tmp;
		},

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
	var _xq = window.xq;
	xq.extend({
		noConfict:function(){
			window.xq = _xq;
			return xq;
		},
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
		trim:function(str){
			str += '';
			return str.trim ? str.trim() : str.replace(trimreg,'');
		},
		each:each,
		grep:function(items,handler){
			var result = xq.isArray(items) ? [] : {}; 
			each(items,function(v,i,l){
				if(handler(v,i,l)){
					result.push(v)
				}
			});
			return result;
		},
		map:function(list,handler,args){
			var result = xq.isArray(list) ? [] : {};
			args = args || [];
			each(list,function(v,i,l){
				push.apply(result,[].concat(handler.apply(null,args.concat(arguments))));
			});
			return result;
		},
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
		stringify:JSON && JSON.stringify && null || stringify,
		parseJSON:JSON && JSON.parse || parse
	});
	window.xq = xq;
	function stringify(o){
		var t = xq.type(o),i,l;
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



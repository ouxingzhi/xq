/**
 * xqFramework 筛选相关方法
 */
;!function(window,document,xq){
	function _next(el){
		while(el = el.nextSibling){
			if(el.nodeType === 1) return el;
		}
		return null;
	}
	function _pre(el){
		while(el = el.previousSibling){
			if(el.nodeType === 1) return el;
		}
		return null;
	}
	
	xq.fn.extend({
		hasClass:function(cls){
			var tmp = xq(),
				reg = RegExp('[\\^\\s]'+cls+'[\\$\\s]');
			this.each(function(el){
				if(el && reg.test(el.className)){
					tmp.push(el);
				}
			});
			return tmp;
		},
		filter:function(expr){
			var handler;
			var tmp = xq();
			if(xq.isFunction(expr)){
				handler = function(el){
					return expr(el);
				}
			}else if(xq.isString(expr)){
				handler = function(el){
					return xq.matches(el,exper);
				}
			}else{
				return tmp;
			}
			
			this.each(function(el){
				if(handler(el)){
					tmp.push(el);
				}
			});
			return tmp;
		},
		is:function(expr){
			var tmp = false;
			if(xq.isFunction(expr)){
				handler = function(el){
					return expr(el);
				}
			}else if(xq.isString(expr)){
				handler = function(el){
					return xq.matches(el,exper);
				}
			}else{
				return tmp;
			}
			this.each(function(el){
				if(handler(el)){
					return tmp = true;
				}
			});
			return tmp;
		},
		has:function(expr){
			var tmp = xq();
			this.each(function(el){
				if(xq(el).find(expr).length){
					tmp.push(el);
				}
			});
			return tmp;
		},
		not:function(expr){
			var handler;
			var tmp = xq();
			if(xq.isFunction(expr)){
				handler = function(el){
					return expr(el);
				}
			}else if(xq.isString(expr)){
				handler = function(el){
					return xq.matches(el,exper);
				}
			}else{
				return tmp;
			}
			
			this.each(function(el){
				if(!handler(el)){
					tmp.push(el);
				}
			});
			return tmp;
		},
		children:function(expr){
			var tmp = xq();
			this.each(function(el){
				xq.each(el.childNodes,function(el){
					if(!expr || xq.matches(el,expr)){
						tmp.push(el)
					}
				});
			});
			return tmp;
		},
		closest:function(expr){
			var handler;
			var tmp = xq();
			if(xq.isFunction(expr)){
				handler = function(el){
					return expr(el);
				}
			}else if(xq.isString(expr)){
				handler = function(el){
					return xq.matches(el,exper);
				}
			}else{
				return tmp;
			}
			this.each(function(el){
				do{
					if(el && handler(el)){
						tmp.push(el);
						return ;
					}
				}while(el = el.parentNode);
			});
			return tmp;
		},
		find:function(expr){
			var tmp = xq();
			this.each(function(el){
				tmp.push(xq(expr,el));
			});	
			return tmp;
		},
		next:function(expr){
			var tmp = xq();
			this.each(function(el){
				var d = _next(el);
				if(!expr || d && xq.matches(d,expr))tmp.push(d);
			});
			return tmp;
		},
		nextAll:function(expr){
			var tmp = xq();
			this.each(function(el){
				while(el && (el = el.nextSibling)){
					if(!expr || xq.matches(el,expr)){
						tmp.push(el);
					}
				}
			});
			return tmp;
		},
		parent:function(expr){
			var tmp = xq();
			this.each(function(el){
				if(!expr && el || el && el.parentNode && xq.matches(el,expr)){
					tmp.push(el);
				}
			});
			return tmp;
		},
		prev:function(expr){
			var tmp = xq();
			this.each(function(el){
				var d = _pre(el);
				if(!expr || d && xq.matches(d,expr))tmp.push(d);
			});
			return tmp;
		},
		prevAll:function(expr){
			var tmp = xq();
			this.each(function(el){
				while(el && (el = el.previousSibling)){
					if(!expr || xq.matches(el,expr)){
						tmp.push(el);
					}
				}
			});
			return tmp;
		},
		siblings:function(expr){
			var tmp = xq();
			this.each(function(el){
				var nodes = el.parentNode.childNodes;
				xq.each(nodes,function(d){
					if(el !== d && d.nodeType === 1 && (!expr || xq.matches(d,expr))){
						tmp.push(el);
					}
				});
			});
			return tmp;
		},
		add:function(){
			this.push.apply(this,arguments);
		}
	});
}(window,document,xq);
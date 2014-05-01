/**
 * xqFramework DOMÄ£¿é
 */
;!function(window,document,xq){
	var dom = document.createElement('div');
	function strToDom(str){
		dom.innerHTML = str;
		var box = document.createDocumentFragment();
		var el = dom.firstChild;
		while(el){
			box.appendChild(el);
			el = el.nextSibling;
		}
		return box;
	}
	/*
	 * ²åÈëÔªËØ
	 */
	function _append(el,child,prepend,fc){
		if(xq.isXqObject(child)){
			child.each(function(c){
				_append(el,c,prepend,prepend && el.firstChild);
			});
		}else if(xq.isElement(child)){
			if(prepend && fc){
				el.insertBefore(child,fc);
			}else{
				el.appendChild(child);
			}
		}else if(xq.isString(child)){
			var child = xq(child);
			_append(el,child,prepend);
		}
	}
	function _after(ela,elb){
		
		if(xq.isXqObject(elb)){
			if(ela.nextSibling){
				elb.each(function(c){
					_after(ela,c);
				});
			}else{
				var parent = ela.parentNode;
				elb.each(function(c){
					parent.appendChild(c);
				});
			}
		}else if(xq.isElement(elb)){
			if(ela.nextSibling){
				ela.parentNode.insertBefore(elb,ela.nextSibling);
			}else{
				ela.parentNode.appendChild(elb);
			}
		}else if(xq.isString(elb)){
			var elb = xq(elb);
			_after(el,elb);
		}
	}
	function _before(ela,elb){
		ela.parentNode.insertBefore(elb,ela);

		if(xq.isXqObject(elb)){
			elb.each(function(c){
				_before(ela,c);
			});
		}else if(xq.isElement(elb)){
			ela.parentNode.insertBefore(elb,ela);
		}else if(xq.isString(elb)){
			var elb = xq(elb);
			_after(el,elb);
		}
	}
	xq.fn.extend({
		append:function(content){
			this.each(function(el){
				_append(el,content);
			});
			return this;
		},
		appendTo:function(content){
			xq(content).append(this);
			return this;
		},
		prepend:function(content){
			this.each(function(el){
				_append(el,content,true,el.firstChild);
			});
			return this;
		},
		prependTo:function(content){
			xq(content).prepend(this);
			return this;
		},
		after:function(content){
			this.each(function(el){
				_after(el,content);
			});
			return this;
		},
		before:function(content){
			this.each(function(el){
				_before(el,content);
			});
			return this;
		},
		wrap:function(html){
			var box = xq(html);
			box.append(this);
			return this;
		},
		unwrap:function(){
			this.each(function(el){
				xq.each(el && el.childNodes||[],function(c){
					el.parentNode.insertBefore(c,el);
				});
				el && el.parentNode.removeChild(el);
			});
			return this;
		},
		empty:function(){
			this.each(function(el){
				el.innerHTML = '';
			});
			return this;
		},
		remove:function(expr){
			this.each(function(el,i,self){
				if(!expr || xq.matches(el,expr)){
					self.__delIdent(el);
					xq.removeData(el);
					el && el.parentNode.removeChild(el);
				}
			});
			return this;
		},
		detach:function(expr){
			return this.remove(exper);
		},
		clone:function(copyEvent){
			var tmp = xq();
			this.each(function(el){
				if(el.cloneNode){
					tmp.push(el.cloneNode(copyEvent));
				}else{
					tmp.push(el);
				}
			})
			return tmp;
		}
	});
}(window,document,xq);
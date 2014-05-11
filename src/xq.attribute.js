/**
 * xqFramework 属性模块
 */
;!function(window,document,xq){
	var attrMaps = {
		'class':'className'
	};

	xq.extend({
		attr:function(el,name,val){
			if(attrMaps[name]){
				name = attrMaps[name];
			}
			if(!val) return el.getAttribute(name);
			el.setAttribute(name,val);
		},
		removeAttr:function(el,name){
			if(attrMaps[name]){
				name = attrMaps[name];
			}
			el.removeAttribute(name);
		},
		addClass:function(el,cls){
			cls = cls.split(/\s+/g)
			if(el.classList){
				el.classList.add.apply(el.classList,cls);
			}else{
				var className = el.className,rcls = [];
				xq.each(cls,function(cls){
					if(!RegExp('[\\^\\s]'+cls+'[\\s$]').test(className)){
						rcls.push(cls);
					}
				});
				el.className = xq.trim(className) + (rcls.length ? ' ' + rcls.join(' ') : '');
			}
		},
		removeClass:function(el,cls){
			cls = cls.split(/\s+/g)
			if(el.classList){
				el.classList.remove.apply(el.classList,cls);
			}else{
				var className = el.className,rcls = [];
				_.each(cls,function(cls){
					className = className.replace(cls,'');
				})
				if(className !== el.className) el.className = className;
			}
		},
		toggleClass:function(el,cls){
			if(el.classList){
				el.classList.toggle(cls);
			}else{
				var reg = RegExp('[\\^\\s]'+cls+'[\\s$]');
				if(reg.test(el.className)){
					el.className = el.className.replace(reg,'').replace(/\s+/,' ');
				}else{
					el.className += ' ' + cls;
				}
			}
		},
		html:function(el,html){
			if(html){
				el.innerHTML = html;
			}else{
				return el.innerHTML;
			}
		},
		text:function(el,text){
			if(text){
				el.innerText = text;
			}else{
				return el.innerText;
			}
		},
		val:function(el,val){
			if(val){
				el.value = val;
			}else{
				return el.value;
			}
		}
	});
	
	xq.fn.extend({
		attr:function(name,val){
			if(val){
				this.each(function(el){
					xq.attr(el,name,val);
				})
			}else if(this.length){
				return xq.attr(this[0],name);
			}
			return null;
		},
		removeAttr:function(name){
			this.each(function(el){
				xq.removeAttr(el,name);
			})
		},
		addClass:function(cls){
			this.each(function(el){
				xq.addClass(el,cls);
			})
		},
		removeClass:function(cls){
			this.each(function(el){
				xq.removeClass(el,cls);
			})
		},
		toggleClass:function(cls){
			this.each(function(el){
				xq.toggleClass(el,cls);
			})
		},
		html:function(html){
			if(html){
				this.each(function(el){
					xq.html(el,html);
				});
			}else if(this.length){
				return xq.html(el);
			}
			return null;
		},
		text:function(el,text){
			if(html){
				this.each(function(el){
					xq.text(el,text);
				});
			}else if(this.length){
				return xq.text(el[0]);
			}
			return null;
		},
		val:function(val){
			if(val){
				this.each(function(el){
					xq.val(el,val);
				})
			}else if(this.length){
				return xq.val(el[0]);
			}
		}
	});
}(window,document,xq);
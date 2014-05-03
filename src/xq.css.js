/**
 * xq Framework css mudule
 */

;!function(window,document,xq){
	var regNumber = /^\d+(?:\.(?:\d+)?)?$/,
		regNotNumber = /[^\d\.]/;
	function _getRealCss(el,name){
		if(window.getComputedStyle){
			return window.getComputedStyle(el)[name];
		}else if(el.currentStyle){
			return el.currentStyle[name];
		}
		return null; 
	}

	function _buildPropertyName(name){
		var ns = name.split('-');
		if(ns.length > 1){
			for(var i=ns.length-1;i>-1;i--){
				if(!ns[i]){
					ns.splice(i,1);
					continue;
				}
				if(i === 0) continue;
				a = ns[i].split('');
				a[0] = a[0].toUpperCase();
				ns[i] = a.join('');
			}
		}
		return ns.join('');
	}
	function _css(el,name,val){
		if(!el) return null;
		if(!val){
			return _getRealCss(el,name);
		}
		//如果值为纯数字则加上默认单位px
		if(regNumber.test(val)){
			val += 'px';
		}
		//如果使用
		if(name.indexOf('-') > -1){
			name = _buildPropertyName(name);
		}
		el.style[name] = val;
	}
	function _offset(el){
		var top = 0, left = 0;
		if(!el) return null;
		do{
			top += el.offsetTop;
			left += el.offsetLeft;
		}while(el = el.offsetParent);
		return {
			top:top,
			left:left
		};
	}
	xq.fn.extend({
		css:function(name,val){
			if(!val){
				return _css(this[0],name);
			}
			this.each(function(el){
				_css(el,name,val);
			});
			return this;
		},
		offset:function(coordinates){
			var def = {left:0,top:0};
			coordinates = coordinates || def;
			var left = parseFloat(coordinates.left) || 0,
				top = parseFloat(coordinates.top) || 0;
			var o = _offset(this[0]);
			if(!o) return def;
			return {
				left:left+o.left,
				top:top+o.top
			};
		},
		position:function(){
			var left = _css(this[0],'left') || 0,
				top = _css(this[0],'top') || 0;
			return {
				left:left,
				top:top
			};
		},
		scrollTop:function(val){
			if(!val){
				return this[0] && this[0].scrollTop || 0;
			}
			this.each(function(el){
				el.scrollTop = val;
			});
			return this;
		},
		scrollLeft:function(val){
			if(!val){
				return this[0] && this[0].scrollLeft || 0;
			}
			
			this.each(function(el){
				el.scrollLeft = val;
			});
			return this;
		},
		height:function(val){
			if(!val){
				return this.css('height');
			}
			var handler;
			if(xq.isFunction(val)){
				handler = function(el,i){
					var h = val(i,el.clientHeight);
					xq(el).css('height',h);
				}
			}else{
				handler = function(el,i){
					xq(el).css('height',val);
				};
			}
			this.each(handler);
			return this;
		},
		width:function(){
			if(!val){
				return this.css('width');
			}
			var handler;
			if(xq.isFunction(val)){
				handler = function(el,i){
					var h = val(i,el.clientWidth);
					xq(el).css('width',h);
				}
			}else{
				handler = function(el,i){
					xq(el).css('width',val);
				};
			}
			this.each(handler);
			return this;
		},
		innerHeight:function(){
			var v = String(this[0] && _getRealCss(this[0],'height') || 0);
			return parseFloat(v.replace(regNotNumber,''));
		},
		innerWidth:function(){
			var v = String(this[0] && _getRealCss(this[0],'width') || 0);
			return parseFloat(v.replace(regNotNumber,''));
		},
		outerHeight:function(ops){
			if(!this[0]) return 0;
			var borderHeight = 0,paddingHeight;
			if(ops) borderHeight = (parseFloat(_getRealCss(this[0],'border-top-width')) || 0) + (parseFloat(_getRealCss(this[0],'border-bottom-width')) || 0);
			paddingHeight = (parseFloat(_getRealCss(this[0],'padding-top')) || 0) + (parseFloat(_getRealCss(this[0],'padding-bottom')) || 0);
			return (parseFloat(_getRealCss(this[0],'height')) || 0) + paddingHeight + borderHeight;
		},
		outerWidth:function(ops){
			if(!this[0]) return 0;
			var borderWidth = 0,paddingWidth;
			if(ops) borderWidth = (parseFloat(_getRealCss(this[0],'border-left-width')) || 0) + (parseFloat(_getRealCss(this[0],'border-right-width')) || 0);
			paddingWidth = (parseFloat(_getRealCss(this[0],'padding-left')) || 0) + (parseFloat(_getRealCss(this[0],'padding-right')) || 0);
			return (parseFloat(_getRealCss(this[0],'height')) || 0) + paddingWidth + borderWidth;
		}
	});
}(window,document,xq);
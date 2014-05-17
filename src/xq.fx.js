/**
 * xq framework fx module
 *
 */
;
! function(window, document, xq, undefined) {
    var requestAnimationFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
            function(callback) {
                setTimeout(callback, 1000 / 60);
        };

    /**
     * 时间线对象，实现播放，暂停，停止，倒放等功能
     * @param ops
     *   {
     *		duration:{Number},	//持续时间
     *		compute:{Function},	//缓动函数
     * 		forward:{Boolean},	//时间线是否是向前
     *		complete:{Function}	//完成回调
     *	}
     *
     */

    function TimeLine(ops) {
        this.curRatio = 0;
        //持续时间
        this.duration = 1000;
        //是否正向
        this.forward = true;
        this.compute = function(ratio) {
            return ratio * 1;
        };
        this.handler = xq.noop;
        this.complete = xq.noop;
        this.state = TimeLine.STATE_STOP;
        this.init(ops || {});
    }
    TimeLine.STATE_STOP = 0;
    TimeLine.STATE_RUNNING = 1;
    TimeLine.STATE_PAUSE = 2;
    TimeLine.prototype = {
        constructor: TimeLine,
        init: function(ops) {
            if (ops.duration) {
                this.duration = ops.duration;
            }
            if (ops.compute) {
                this.compute = ops.compute;
            }
            if (ops.handler) {
                this.handler = ops.handler;
            }
            if (ops.forward) {
                this.forward = ops.forward;
            }
            if (ops.complete) {
                this.complete = ops.complete;
            }
            if (this.forward) {
                this._callHandler(0);
            } else {
                this._callHandler(1);
            }
        },
        play: function() {
            if (this.state === TimeLine.STATE_RUNNING) return;
            if (this.state === TimeLine.STATE_STOP) {
                this._callHandler(this._getInitRatio());
            }
            this.state = TimeLine.STATE_RUNNING;
            this._loop();
        },
        setForward: function(forward) {
            this.forward = !! forward;
        },
        getForward: function() {
            return !!this.forward;
        },
        setCompute: function(fun) {
            this.compute = fun;
        },
        pause: function() {
            if (this.state === TimeLine.STATE_STOP) return;
            this.state = TimeLine.STATE_PAUSE;
        },
        stop: function() {
            this.state = TimeLine.STATE_STOP;
        },
        reset: function() {
            this.state = TimeLine.STATE_STOP;
            this._callHandler(this._getInitRatio());
        },
        go: function(ratio) {
            this.curRatio = ratio;
            this._callHandler(this.curRatio);
        },
        _getInitRatio: function() {
            return this.forward ? 0 : 1;
        },
        _computeRatio: function(interval) {
            var last = this.curRatio * this.duration,
                cur;
            if (this.forward) {
                cur = last + interval;
            } else {
                cur = last - interval;
            }
            this.curRatio = cur / this.duration;
            if (this.curRatio > 1) this.curRatio = 1;
            if (this.curRatio < 0) this.curRatio = 0;
        },
        _callHandler: function(curRatio) {
            var val = this.compute(curRatio);
            this.curRatio = curRatio;
            this.handler(val, curRatio);
        },
        _compute: function(interval) {
            var isComplete = false;
            var start = new Date();
            this._computeRatio(interval);
            this._callHandler(this.curRatio);
            if ((isComplete = (this.forward && this.curRatio === 1 || !this.forward && this.curRatio === 0)) || this.state === TimeLine.STATE_PAUSE || this.state === TimeLine.STATE_STOP) {
                if (isComplete) {
                    this.state = TimeLine.STATE_STOP;
                    this.complete();
                }
                return false;
            }
            //更正比例
            interval = new Date() - start;
            this._computeRatio(interval);
            return true;
        },
        _loop: function() {
            var self = this;
            var start = new Date();
            requestAnimationFrame(function() {
                var end = new Date(),
                    //计算距上一帧的时间长度
                    interval = end - start;
                //计算时间并返回是否时间没有完成
                if (self._compute(interval)) {
                    self._loop();
                }
            });
        }
    };
    //缓动动画定义
    //缓动效果定义参考: jqueryui easing
    var baseEasings = {};
    xq.each(['Quad', 'Cubic', 'Quart', 'Quint', 'Expo'], function(v, i) {
        baseEasings[name] = function(p) {
            return Math.pow(p, i + 2);
        };
    });
    xq.extend(baseEasings, {
        Sine: function(p) {
            return 1 - Math.cos(p * Math.PI / 2);
        },
        Circ: function(p) {
            return 1 - Math.sqrt(1 - p * p);
        },
        Elastic: function(p) {
            return p === 0 || p === 1 ? p : -Math.pow(2, 8 * (p - 1)) * Math.sin(((p - 1) * 80 - 7.5) * Math.PI / 15);
        },
        Back: function(p) {
            return p * p * (3 * p - 2);
        },
        Bounce: function(p) {
            var pow2,
                bounce = 4;

            while (p < ((pow2 = Math.pow(2, --bounce)) - 1) / 11) {}
            return 1 / Math.pow(4, 3 - bounce) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - p, 2);
        }
    });
    xq.fx = {};
    xq.fx.easing = {
    	linear: function( p ) {
			return p;
		},
		swing: function( p ) {
			return 0.5 - Math.cos( p * Math.PI ) / 2;
		}
    };
    xq.each(baseEasings, function(easeIn, name) {
        xq.fx.easing["easeIn" + name] = easeIn;
        xq.fx.easing["easeOut" + name] = function(p) {
            return 1 - easeIn(1 - p);
        };
        xq.fx.easing["easeInOut" + name] = function(p) {
            return p < 0.5 ?
                easeIn(p * 2) / 2 :
                1 - easeIn(p * -2 + 2) / 2;
        };
    });
    xq.fx.TimeLine = TimeLine;

    /**
     * animation
     */
    var regColorName = /[a-z]+/i,
    	regRgb = /rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/i,
        regRgba = /rgba\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([\d\.]+)\s*\)/i,
        regHex = /^#(?:([\da-f]{2})([\da-f]{2})([\da-f]{2})|([\da-f])([\da-f])([\da-f]))$/i;
    	regUnit = /^(\d*|\d*(?:\.\d+))(px|pc|pt|in|mm|cm|em|ex)?$/i;

    //颜色名对应颜色值
    var colorNameMap = {
        black: [0, 0, 0],
        silver: [192, 192, 192],
        gray: [128, 128, 128],
        white: [255, 255, 255],
        maroon: [128, 0, 0],
        red: [255, 0, 0],
        purple: [128, 0, 128],
        fuchsia: [255, 0, 255],
        green: [0, 128, 0],
        lime: [0, 255, 0],
        olive: [128, 128, 0],
        yellow: [255, 255, 0],
        navy: [0, 0, 128],
        blue: [0, 0, 255],
        teal: [0, 128, 128],
        aqua: [0, 255, 255],
        aliceblue: [240, 248, 255],
        antiquewhite: [250, 235, 215],
        aqua: [0, 255, 255],
        aquamarine: [127, 255, 212],
        azure: [240, 255, 255],
        beige: [245, 245, 220],
        bisque: [255, 228, 196],
        black: [0, 0, 0],
        blanchedalmond: [255, 235, 205],
        blue: [0, 0, 255],
        blueviolet: [138, 43, 226],
        brown: [165, 42, 42],
        burlywood: [222, 184, 135],
        cadetblue: [95, 158, 160],
        chartreuse: [127, 255, 0],
        chocolate: [210, 105, 30],
        coral: [255, 127, 80],
        cornflowerblue: [100, 149, 237],
        cornsilk: [255, 248, 220],
        crimson: [220, 20, 60],
        cyan: [0, 255, 255],
        darkblue: [0, 0, 139],
        darkcyan: [0, 139, 139],
        darkgoldenrod: [184, 134, 11],
        darkgray: [169, 169, 169],
        darkgreen: [0, 100, 0],
        darkgrey: [169, 169, 169],
        darkkhaki: [189, 183, 107],
        darkmagenta: [139, 0, 139],
        darkolivegreen: [85, 107, 47],
        darkorange: [255, 140, 0],
        darkorchid: [153, 50, 204],
        darkred: [139, 0, 0],
        darksalmon: [233, 150, 122],
        darkseagreen: [143, 188, 143],
        darkslateblue: [72, 61, 139],
        darkslategray: [47, 79, 79],
        darkslategrey: [47, 79, 79],
        darkturquoise: [0, 206, 209],
        darkviolet: [148, 0, 211],
        deeppink: [255, 20, 147],
        deepskyblue: [0, 191, 255],
        dimgray: [105, 105, 105],
        dimgrey: [105, 105, 105],
        dodgerblue: [30, 144, 255],
        firebrick: [178, 34, 34],
        floralwhite: [255, 250, 240],
        forestgreen: [34, 139, 34],
        fuchsia: [255, 0, 255],
        gainsboro: [220, 220, 220],
        ghostwhite: [248, 248, 255],
        gold: [255, 215, 0],
        goldenrod: [218, 165, 32],
        gray: [128, 128, 128],
        green: [0, 128, 0],
        greenyellow: [173, 255, 47],
        grey: [128, 128, 128],
        honeydew: [240, 255, 240],
        hotpink: [255, 105, 180],
        indianred: [205, 92, 92],
        indigo: [75, 0, 130],
        ivory: [255, 255, 240],
        khaki: [240, 230, 140],
        lavender: [230, 230, 250],
        lavenderblush: [255, 240, 245],
        lawngreen: [124, 252, 0],
        lemonchiffon: [255, 250, 205],
        lightblue: [173, 216, 230],
        lightcoral: [240, 128, 128],
        lightcyan: [224, 255, 255],
        lightgoldenrodyellow: [250, 250, 210],
        lightgray: [211, 211, 211],
        lightgreen: [144, 238, 144],
        lightgrey: [211, 211, 211],
        lightpink: [255, 182, 193],
        lightsalmon: [255, 160, 122],
        lightseagreen: [32, 178, 170],
        lightskyblue: [135, 206, 250],
        lightslategray: [119, 136, 153],
        lightslategrey: [119, 136, 153],
        lightsteelblue: [176, 196, 222],
        lightyellow: [255, 255, 224],
        lime: [0, 255, 0],
        limegreen: [50, 205, 50],
        linen: [250, 240, 230],
        magenta: [255, 0, 255],
        maroon: [128, 0, 0],
        mediumaquamarine: [102, 205, 170],
        mediumblue: [0, 0, 205],
        mediumorchid: [186, 85, 211],
        mediumpurple: [147, 112, 219],
        mediumseagreen: [60, 179, 113],
        mediumslateblue: [123, 104, 238],
        mediumspringgreen: [0, 250, 154],
        mediumturquoise: [72, 209, 204],
        mediumvioletred: [199, 21, 133],
        midnightblue: [25, 25, 112],
        mintcream: [245, 255, 250],
        mistyrose: [255, 228, 225],
        moccasin: [255, 228, 181],
        navajowhite: [255, 222, 173],
        navy: [0, 0, 128],
        oldlace: [253, 245, 230],
        olive: [128, 128, 0],
        olivedrab: [107, 142, 35],
        orange: [255, 165, 0],
        orangered: [255, 69, 0],
        orchid: [218, 112, 214],
        palegoldenrod: [238, 232, 170],
        palegreen: [152, 251, 152],
        paleturquoise: [175, 238, 238],
        palevioletred: [219, 112, 147],
        papayawhip: [255, 239, 213],
        peachpuff: [255, 218, 185],
        peru: [205, 133, 63],
        pink: [255, 192, 203],
        plum: [221, 160, 221],
        powderblue: [176, 224, 230],
        purple: [128, 0, 128],
        red: [255, 0, 0],
        rosybrown: [188, 143, 143],
        royalblue: [65, 105, 225],
        saddlebrown: [139, 69, 19],
        salmon: [250, 128, 114],
        sandybrown: [244, 164, 96],
        seagreen: [46, 139, 87],
        seashell: [255, 245, 238],
        sienna: [160, 82, 45],
        silver: [192, 192, 192],
        skyblue: [135, 206, 235],
        slateblue: [106, 90, 205],
        slategray: [112, 128, 144],
        slategrey: [112, 128, 144],
        snow: [255, 250, 250],
        springgreen: [0, 255, 127],
        steelblue: [70, 130, 180],
        tan: [210, 180, 140],
        teal: [0, 128, 128],
        thistle: [216, 191, 216],
        tomato: [255, 99, 71],
        turquoise: [64, 224, 208],
        violet: [238, 130, 238],
        wheat: [245, 222, 179],
        white: [255, 255, 255],
        whitesmoke: [245, 245, 245],
        yellow: [255, 255, 0],
        yellowgreen: [154, 205, 50]
    };
    var nameToColor = function(name) {
    		return colorNameMap[(name || '').toLowerCase()] || null;
    	},
    	rgbToColor = function(str){
    		var m = regRgb.exec(str);
    		if(!m) return null;
    		var color = [];
    		color[0] = parseFloat(m[1]),
    		color[1] = parseFloat(m[2]),
    		color[2] = parseFloat(m[3]);
    		return color;
   		},
    	rgbaToColor = function(str){
    		var m = regRgba.exec(str);
    		if(!m) return null;
    		var color = [];
    		color[0] = parseFloat(m[1]);
    		color[1] = parseFloat(m[2]);
    		color[2] = parseFloat(m[3]);
    		color[3] = parseFloat(m[4]);
    		return color;
   		},
   		hexToColor = function(str){
   			var m = regHex.exec(str);
    		if(!m) return null;
    		var color = [];
    		if(m[1]){
	    		color[0] = parseInt('0x'+m[1]);
	    		color[1] = parseInt('0x'+m[2]);
	    		color[2] = parseInt('0x'+m[3]);
	    	}else{
	    		color[0] = parseInt('0x'+m[4]+m[4]);
	    		color[1] = parseInt('0x'+m[5]+m[5]);
	    		color[2] = parseInt('0x'+m[6]+m[6]);
	    	}
    		return color;
   		};
    //获得颜色值
    var getColor = function(str) {
    	if(regHex.test(str)){
    		return hexToColor(str);
    	}else if(regRgb.test(str)){
    		return rgbToColor(str);
    	}else if(regRgba.test(str)){
    		return rgbaToColor(str);
    	}else if(regColorName.test(str)){
    		return nameToColor(str);
    	}else if(colorNameMap[str]){
            return colorNameMap[str];
        }
    	return null;
    }

    //任何颜色格式转成Rgb格式
    var colorToRgb = function(str){
	    	var color = getColor(str);
	    	if(!color) return null;
	    	return 'rgb('+color.join(',')+')'
	    };
	//任何颜色格式转Hex格式
	var colorToHex = function(str){
	    	var color = getColor(str);
	    	if(!color) return null;
	    	var r = color[0].toString(16),
	    		g = color[1].toString(16),
	    		b = color[2].toString(16);
	    	r.length === 1 && (r = '0' + r);
	    	g.length === 1 && (g = '0' + g);
	    	b.length === 1 && (b = '0' + b);
	    	return '#'+r+g+b;
	    };
    var regNumUnit = /^(-?(?:\d+(?:\.(?:\d+)?)?|(?:\.\d+)))([a-z]+)?/i,
        regNum = /^-?(?:\d+(?:\.(?:\d+)?)?|(?:\.\d+))$/i;

    var getStyleVal = function(el,sname){
        var val = xq.css(el,sname),sval;
        return val === 'auto' ? 0 : (sval = parseFloat(val),isNaN(sval)) ? val : sval;
    };

	var buildDispose = function(params,list){
		var els = [];
		list.each(function(el){
			var sty = {
				el:el,
				style:{}
			};
			xq.each(params,function(v,styleName){
                var start,end,diff,m,unit,send;
                //颜色
                if(end = getColor(v)){
                    start = getStyleVal(el,styleName);
                    start = getColor(start);
                    if(!start) return;
                    sty.style[styleName] = {
                        start:start,
                        end:end,
                        diff:[
                            end[0] - start[0],
                            end[1] - start[1],
                            end[2] - start[2]
                        ],
                        format:function(r){
                            var color = 'rgb(' + parseInt(this.start[0] + r * this.diff[0]) + ',' + parseInt(this.start[1] + r * this.diff[1]) + ',' +  parseInt(this.start[2] + r * this.diff[2]) + ')';
                            return color;
                        }
                    };
                }else if(m = regNumUnit.exec(v)){
                    end = parseFloat(m[1]);
                    unit = m[2];
                    //var m = regNumUnit.exec(v);
                    //if(!m) return;
                    //获得开始值
                    start = getStyleVal(el,styleName);
                    if(unit && unit !== 'px'){
                        xq.css(el,styleName,v);
                        send = end;
                        end = getStyleVal(el,styleName);
                        xq.css(el,styleName,start);
                        start = (send / end) * start;
                        end = (send / end) * end;
                    }
                    diff = end - start;
                    
                    sty.style[styleName] = {
                        start:start,
                        end:end,
                        diff:diff,
                        unit:unit,
                        format:function(r){
                            var size = (this.start + r * this.diff) + (this.unit || '');
                            console.log(size,r,this.start,this.diff);
                            return size;
                        }
                    };
                }
			});
			els.push(sty);
		});
        return els;
	};
    var _getElSize = function(el){

    }
    var regspeed = /^\d+|slow|normal|fast$/i,
        speedMap = {
            slow: 600,
            fast: 200,
            normal: 400
        };
    var __show = xq.fn.show,
        __hide = xq.fn.hide;
    xq.fn.extend({
    	animate:function(params,speed,easing,fn){
            if(speed && !regspeed.test(speed)){
                easing = speed;
                fn = easing;
                speed = null;
            }
            if(easing && !xq.isString(easing)){
                fn = easing;
                easing = null;
            }
            params = params || {};
            speed = speedMap[speed] || parseFloat(speed) || speedMap['normal'];
            fn = fn || xq.noop;
            easing = easing;
            easingfn = xq.fx.easing[easing] || xq.fx.easing['swing'];
    		var fxinfo = buildDispose(params,this);
            var tl = new TimeLine({
                duration:speed,
                compute:easingfn,
                handler:function(r){
                    xq.each(fxinfo,function(obj){
                        xq.each(obj.style,function(sty,styleName){
                            xq.css(obj.el,styleName,sty.format(r));
                        });
                    });
                },
                complete:fn
            });
            tl.play();

    	},
        show:function(speed,easing,fn){
            if(speed && !regspeed.test(speed)){
                easing = speed;
                fn = easing;
                speed = null;
            }
            if(easing && !xq.isString(easing)){
                fn = easing;
                easing = null;
            }
            if(!speed){
                this.each(function(el){
                    if(el && el.style){
                        el.style.display = 'inline-block';
                    }
                });
            }else{
                this.each(function(el){
                    if(xq.css(el,'display') === 'none'){
                        var $el = xq(el);
                        $el.css({
                            'display':'inline-block',
                            'overflow':'hidden',
                            'zoom':'1'
                        });
                        var h = $el.css('height'),
                            w = $el.css('width');
                        $el.css({
                            'height':'0px',
                            'width':'0px'
                        });
                        $el.animate({
                            width:w,
                            height:h
                        },speed,easing,function(){
                            $el.css({
                                'height':'',
                                'width':''
                            });
                            fn && fn();
                        });
                    }
                });
            }
            return this;
        },
        hide:function(speed,easing,fn){
            if(speed && !regspeed.test(speed)){
                easing = speed;
                fn = easing;
                speed = null;
            }
            if(easing && !xq.isString(easing)){
                fn = easing;
                easing = null;
            }
            if(!speed){
                this.each(function(el){
                    if(el && el.style){
                        el.style.display = 'none';
                    }
                });
            }else{
                this.each(function(el){
                    if(xq.css(el,'display') !== 'none'){
                        var $el = xq(el);
                        $el.css({
                            'display':'inline-block',
                            'overflow':'hidden',
                            'zoom':'1'
                        });
                        $el.animate({
                            width:'0px',
                            height:'0px'
                        },speed,easing,function(){
                            $el.css({
                                'display':'none',
                                'width':'',
                                'height':''
                            });
                            fn && fn();
                        });
                    }
                });
            }
            return this;
        },
        slideDown:function(speed,easing,fn){
            if(speed && !regspeed.test(speed)){
                easing = speed;
                fn = easing;
                speed = null;
            }
            if(easing && !xq.isString(easing)){
                fn = easing;
                easing = null;
            }
            this.each(function(el){
                if(xq.css(el,'display') === 'none'){
                    var $el = xq(el);
                    $el.css({
                        'display':'inline-block',
                        'overflow':'hidden',
                        'zoom':'1'
                    });
                    var h = $el.css('height');
                    $el.css({
                        'height':'0px'
                    });
                    $el.animate({
                        height:h
                    },speed,easing,function(){
                        $el.css({
                            'height':''
                        });
                        fn && fn();
                    });
                }
            });
            return this;
        },
        slideUp:function(speed,easing,fn){
            if(speed && !regspeed.test(speed)){
                easing = speed;
                fn = easing;
                speed = null;
            }
            if(easing && !xq.isString(easing)){
                fn = easing;
                easing = null;
            }
            this.each(function(el){
                if(xq.css(el,'display') !== 'none'){
                    var $el = xq(el);
                    $el.css({
                        'display':'inline-block',
                        'overflow':'hidden',
                        'zoom':'1'
                    });
                    $el.animate({
                        height:'0px'
                    },speed,easing,function(){
                        $el.css({
                            'display':'none',
                            'height':''
                        });
                        fn && fn();
                    });
                }
            });
        },
        fadeIn:function(speed,easing,fn){
            if(speed && !regspeed.test(speed)){
                easing = speed;
                fn = easing;
                speed = null;
            }
            if(easing && !xq.isString(easing)){
                fn = easing;
                easing = null;
            }
            this.each(function(el){
                if(xq.css(el,'display') === 'none'){
                    var $el = xq(el);
                    $el.css({
                        'opacity':'0',
                        'display':'inline-block'
                    });
                    $el.animate({
                        'opacity':'1'
                    },speed,easing,function(){
                        fn && fn();
                    });
                }
            });
            return this;
        },
        fadeOut:function(speed,easing,fn){
            if(speed && !regspeed.test(speed)){
                easing = speed;
                fn = easing;
                speed = null;
            }
            if(easing && !xq.isString(easing)){
                fn = easing;
                easing = null;
            }
            this.each(function(el){
                if(xq.css(el,'display') !== 'none'){
                    var $el = xq(el);
                    $el.css({
                        'opacity':'1'
                    });
                    $el.animate({
                        'opacity':'0'
                    },speed,easing,function(){
                        $el.css({
                            'display':'none'
                        });
                        fn && fn();
                    });
                }
            });
            return this;
        }
    });
}(window, document, xq);

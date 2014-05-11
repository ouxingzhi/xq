/**
 * xq framework fx module
 */
;!function(window,document,xq,undefined){
	var requestAnimationFrame = window.requestAnimationFrame ||
						 window.webkitRequestAnimationFrame ||
						 window.mozRequestAnimationFrame || 
						 function(callback){
						 	setTimeout(callback,1000/60);
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
	function TimeLine(ops){
		this.curRatio = 0;
		//持续时间
		this.duration = 1000;
		//是否正向
		this.forward = true;
		this.compute = function(ratio){
			return ratio * 1;
		};
		this.handler = xq.noop;
		this.complete = xq.noop;
		this.state = TimeLine.STATE_STOP;
		this.init(ops||{});
	}
	TimeLine.STATE_STOP = 0;
	TimeLine.STATE_RUNNING = 1;
	TimeLine.STATE_PAUSE = 2;
	TimeLine.prototype = {
		constructor:TimeLine,
		init:function(ops){
			if(ops.duration){
				this.duration = ops.duration * 1000;
			}
			if(ops.compute){
				this.compute = ops.compute;
			}
			if(ops.handler){
				this.handler = ops.handler;
			}
			if(ops.forward){
				this.forward = ops.forward;
			}
			if(ops.complete){
				this.complete = ops.complete;
			}
			if(this.forward){
				this._callHandler(0);
			}else{
				this._callHandler(1);
			}
		},
		play:function(){
			if(this.state === TimeLine.STATE_RUNNING) return;
			if(this.state === TimeLine.STATE_STOP){
				this._callHandler(this._getInitRatio());
			}
			this.state = TimeLine.STATE_RUNNING;
			this._loop();
		},
		setForward:function(forward){
			this.forward = !!forward;
		},
		getForward:function(){
			return !!this.forward; 
		},
		setCompute:function(fun){
			this.compute = fun;
		},
		pause:function(){
			if(this.state === TimeLine.STATE_STOP) return;
			this.state = TimeLine.STATE_PAUSE;
		},
		stop:function(){
			this.state = TimeLine.STATE_STOP;
		},
		reset:function(){
			this.state = TimeLine.STATE_STOP;
			this._callHandler(this._getInitRatio());
		},
		go:function(ratio){
			this.curRatio = ratio;
			this._callHandler(this.curRatio);
		},
		_getInitRatio:function(){
			return this.forward ? 0 : 1;
		},
		_computeRatio:function(interval){
			var last = this.curRatio * this.duration,
				cur;
			if(this.forward){
				cur = last + interval;
			}else{
				cur = last - interval;
			}
			this.curRatio = cur / this.duration;
			if(this.curRatio > 1) this.curRatio = 1;
			if(this.curRatio < 0) this.curRatio = 0;
		},
		_callHandler:function(curRatio){
			var val = this.compute(curRatio);
			this.curRatio = curRatio;
			this.handler(val,curRatio);
		},
		_compute:function(interval){
			var isComplete = false;
			var start = new Date();
			this._computeRatio(interval);
			this._callHandler(this.curRatio);
			if((isComplete = (this.forward && this.curRatio === 1 || !this.forward && this.curRatio === 0)) || this.state === TimeLine.STATE_PAUSE || this.state === TimeLine.STATE_STOP){
				if(isComplete){
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
		_loop:function(){
			var self = this;
			var start = new Date();
			requestAnimationFrame(function(){
				var end = new Date(),
					//计算距上一帧的时间长度
					interval = end - start;
				//计算时间并返回是否时间没有完成
				if(self._compute(interval)){
					self._loop();
				}
			});
		}
	};
	//缓动动画定义
	//缓动效果定义参考: jqueryui easing
	var baseEasings = {};
	xq.each(['Quad','Cubic','Quart','Quint','Expo'],function(v,i){
		baseEasings[name] = function(p){
			return Math.pow(p,i+2);
		};
	});
	xq.extend( baseEasings, {
		Sine: function ( p ) {
			return 1 - Math.cos( p * Math.PI / 2 );
		},
		Circ: function ( p ) {
			return 1 - Math.sqrt( 1 - p * p );
		},
		Elastic: function( p ) {
			return p === 0 || p === 1 ? p :
				-Math.pow( 2, 8 * (p - 1) ) * Math.sin( ( (p - 1) * 80 - 7.5 ) * Math.PI / 15 );
		},
		Back: function( p ) {
			return p * p * ( 3 * p - 2 );
		},
		Bounce: function ( p ) {
			var pow2,
				bounce = 4;

			while ( p < ( ( pow2 = Math.pow( 2, --bounce ) ) - 1 ) / 11 ) {}
			return 1 / Math.pow( 4, 3 - bounce ) - 7.5625 * Math.pow( ( pow2 * 3 - 2 ) / 22 - p, 2 );
		}
	});
	xq.fx = {};
	xq.fx.easing = {};
	xq.each( baseEasings, function(  easeIn,name ) {
		xq.fx.easing[ "easeIn" + name ] = easeIn;
		xq.fx.easing[ "easeOut" + name ] = function( p ) {
			return 1 - easeIn( 1 - p );
		};
		xq.fx.easing[ "easeInOut" + name ] = function( p ) {
			return p < 0.5 ?
				easeIn( p * 2 ) / 2 :
				1 - easeIn( p * -2 + 2 ) / 2;
		};
	});
	xq.fx.TimeLine = TimeLine;
}(window,document,xq);
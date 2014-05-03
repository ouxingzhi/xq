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

	function Media(ops){
		this.startTime;
		this.endTime;
		this.curRatio = 0;
		//持续时间
		this.duration = 1000;
		this.total = 100;
		//是否暂停
		this.isPause = false;
		this.isStop = false;
		this.compute = function(ratio,total){
			return ratio * total;
		};
		this.handler = function(){

		}
		this.init(ops||{});
	}
	Media.prototype = {
		constructor:Media,
		init:function(ops){
			if(ops.duration){
				this.duration = ops.duration * 1000;
			}
			if(ops.total){
				this.total = ops.total;
			}
			if(ops.handler){
				this.handler = ops.handler;
			}
		},
		play:function(){
			this.startTime = new Date();
			this.endTime = new Date(this.startTime + this.duration);
			this.curRatio = 0;
			this._run();
		},
		pause:function(){

		},
		stop:function(){

		},
		go:function(ratio){

		},
		_run:function(){
			var self = this;
			requestAnimationFrame(function(){
				var p = new Date() - self.startTime,val;
				if(p < 0) return ;
				self.curRatio = p/self.duration;
				if(self.curRatio >= 1){
					val = self.compute(1,self.total);
					self.handler(val,self.total,1);
					return;
				}else{
					val = self.compute(self.curRatio,self.total);
					self.handler(val,self.total,self.curRatio);
				}
				self._run();
			});
		}
	};
	
	window.Media = Media;
}(window,document,xq);
/* xq 0.1.0 2014-05-01 */
!function(a,b,c){function d(a,b,c){a.addEventListener?a.addEventListener(b,c,!1):a.attachEvent?a.attachEvent("on"+b,c):a["on"+b]=c}function e(a,b,c){a.removeEventListener?a.removeEventListener(b,c):a.detachEvent?a.detachEvent("on"+b,c):delete a["on"+b]}function f(){return"handlers"+o}function g(a){return a+"_handlers_"+o}function h(a,b,c){var d=-1;return c?b?each(a,function(a,b){return a.selector===c?(d=b,!0):void 0}):each(a,function(a,e){return a.handler===b&&a.selector===c?(d=e,!0):void 0}):each(a,function(a){return a.handler===b?(d=i,!0):void 0}),d}function j(a,b,d){for(var e=oQuery(b,d),f=0,g=e.length;g>f;f++)if(c.container(a,e[f],d))return e[f];return!1}function k(b,e,h,i,k,m){var n=f(),o=c.data(b,n)||{};if(o[e])o[e].push({el:b,type:e,handler:h,args:i,selector:k,isOne:m});else{o[e]=[{el:b,type:e,handler:h,args:i,selector:k,isOne:m}];var p=g(e),q=function(b){b=b||a.event;var d,f=c.toArray(arguments),g=b.srcElement||b.target;c.each(o[e],function(a){a.args&&(f=f.concat(a.args)),a.selector?(oQuery.matchesSelector(g,a.selector,a.el)||(d=j(g,a.selector,a.el)))&&(d=d||g,a.handler.apply(d,f),a.isOne&&l(a.el,a.type,a.handler,a.selector)):(a.handler.apply(a.el,f),a.isOne&&l(a.el,a.type,a.handler,a.selector))})};c.data(b,n,o),c.data(b,p,q),d(b,e,q)}}function l(a,b,d,i){var j,k=c.data(a,f())||{},l=g(b),m=c.data(a,l);k[b]&&(d?(j=h(k[b],d,i),j>-1&&k[b].splice(j,1),k[b].length||(delete k[b],e(a,b,m),c.removeData(a,l))):(delete k[b],e(a,b,m),c.removeData(a,l)))}function m(a,c){var d;b.createEvent?(d=b.createEvent("HTMLEvents"),d.iniEvent(c,!1,!0),a.dispatchEvent(d)):b.createEventObject&&(d=b.createEventObject(),a.fireEvent(c,d))}function n(){q=!0,c.each(p,function(a){a()}),p=null,n=c.noop}var o=(new Date).getTime()+"_"+function(a){for(var b=0,c="";a>b;b++)c+=(36*Math.random()|0).toString(36);return c}(10);c.fn.extend({on:function(a,b,d,e,f){if(c.isFunction(d)&&(e=d,c.isArray(b)?(d=b,b=null):d=c.isString(b)?null:b=null),c.isFunction(b)&&(e=b,d=b=null),!c.isFunction(e))throw"The arguments have no function";return c.isFunction(e)?(this.each(function(c){k(c,a,e,d,b,f)}),this):this},off:function(a,b,d){return c.isFunction(b)&&(d=b,b=null),this.each(function(c){l(c,a,d,b)}),this},trigger:function(a){return this.each(function(b){m(b,a)}),this},bind:function(a,b,c){return this.on(a,null,b,c)},one:function(a,b,c){return this.on(a,null,b,c,!0)},unbind:function(a,b){return this.off(a,null,b)},live:function(a,c,d){return k(b.documentElement,a,d,c,this.selector),this},die:function(a,c){return l(b.documentElement,a,c,this.selector),this},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return this.off(b,a,c)}});var p=[],q=!1;if(b.addEventListener)b.addEventListener("DOMContentLoaded",n);else{var r=b.getElementsByTagName("html")[0];!function s(){try{r.doScroll("up"),n(),r=null}catch(a){setTimeout(s,20)}}()}c.extend({ready:function(a){c.isFunction(a)&&(q?a():p.push(a))}})}(window,document,xq);
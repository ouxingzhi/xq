/* xq 0.1.0 2014-05-01 */
!function(a,b,c){function d(a){for(;a=a.nextSibling;)if(1===a.nodeType)return a;return null}function e(a){for(;a=a.previousSibling;)if(1===a.nodeType)return a;return null}c.fn.extend({hasClass:function(a){var b=c(),d=RegExp("[\\^\\s]"+a+"[\\$\\s]");return this.each(function(a){a&&d.test(a.className)&&b.push(a)}),b},filter:function(a){var b,d=c();if(c.isFunction(a))b=function(b){return a(b)};else{if(!c.isString(a))return d;b=function(a){return c.matches(a,exper)}}return this.each(function(a){b(a)&&d.push(a)}),d},is:function(a){var b=!1;if(c.isFunction(a))handler=function(b){return a(b)};else{if(!c.isString(a))return b;handler=function(a){return c.matches(a,exper)}}return this.each(function(a){return handler(a)?b=!0:void 0}),b},has:function(a){var b=c();return this.each(function(d){c(d).find(a).length&&b.push(d)}),b},not:function(a){var b,d=c();if(c.isFunction(a))b=function(b){return a(b)};else{if(!c.isString(a))return d;b=function(a){return c.matches(a,exper)}}return this.each(function(a){b(a)||d.push(a)}),d},children:function(a){var b=c();return this.each(function(d){c.each(d.childNodes,function(d){(!a||c.matches(d,a))&&b.push(d)})}),b},closest:function(a){var b,d=c();if(c.isFunction(a))b=function(b){return a(b)};else{if(!c.isString(a))return d;b=function(a){return c.matches(a,exper)}}return this.each(function(a){do if(a&&b(a))return void d.push(a);while(a=a.parentNode)}),d},find:function(a){var b=c();return this.each(function(d){b.push(c(a,d))}),b},next:function(a){var b=c();return this.each(function(e){var f=d(e);(!a||f&&c.matches(f,a))&&b.push(f)}),b},nextAll:function(a){var b=c();return this.each(function(d){for(;d&&(d=d.nextSibling);)(!a||c.matches(d,a))&&b.push(d)}),b},parent:function(a){var b=c();return this.each(function(d){(!a&&d||d&&d.parentNode&&c.matches(d,a))&&b.push(d)}),b},prev:function(a){var b=c();return this.each(function(d){var f=e(d);(!a||f&&c.matches(f,a))&&b.push(f)}),b},prevAll:function(a){var b=c();return this.each(function(d){for(;d&&(d=d.previousSibling);)(!a||c.matches(d,a))&&b.push(d)}),b},siblings:function(a){var b=c();return this.each(function(d){var e=d.parentNode.childNodes;c.each(e,function(e){d===e||1!==e.nodeType||a&&!c.matches(e,a)||b.push(d)})}),b},add:function(){this.push.apply(this,arguments)}})}(window,document,xq);
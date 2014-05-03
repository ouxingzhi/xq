/**
 * xq Framework ajax模块
 */

;
! function(window, document, xq) {
	function _getxhr() {
		if (window.XMLHttpRequest) {
			getxhr = function() {
				return new XMLHttpRequest();
			}
		} else if (window.ActiveXObject) {
			getxhr = function() {
				return new ActiveXObject('Microsoft.XMLHttp');
			}
		} else {
			throw "browser does not support ajax";
		}
		return getxhr();
	}



	//用于删除head中不符合要求的字符
	var regHeadKeyClear = /[\s\t\n\r:]/g,
		regHeadValueClear = /[\t\n\r]/g,
		regClearAnd = /\?+&+/g,
		regOneAnd = /&+/g,
		regRightAnd = /(?:\?+|&+)$/g,
		regJsonpCallback = /([^=&?]+)=\?/g;



	var CONTENT_TYPE_FROM = 'application/x-www-form-urlencoded',
		CONTENT_TYPE_JSON = 'appliction/json';

	var DATA_TYPE_JSON = 'json',
		DATA_TYPE_TEXT = 'text',
		DATA_TYPE_XML = 'xml',
		DATA_TYPE_HTML = 'html',
		DATA_TYPE_SCRIPT = 'script',
		DATA_TYPE_JSONP = 'jsonp';

	var config = {
		contentType: CONTENT_TYPE_FROM,
		beforeSend: xq.noop,
		timeout: 30000,
		cache: true,
		complete: xq.noop,
		headers: {},
		dataType: 'text',
		crossDomain: false,
		async: true,
		accepts: [],
		contents: {},
		callback: 'callback=?',
		type: 'GET',
		charset :'charset=utf-8',
		converters: {
			'* text': window.String,
			'text html': true,
			'text json': xq.parseJSON,
			'text xml': xq.parseXML
		},
		data: null,
		dataFilter: null,
		error: xq.noop,
		ifModified: null,
		isLocal: false,
		jsonp: 'callback=?',
		jsonpCallback: null,
		mimeType: null,

		password: null,

		processData: true,

		scriptCharset: null,

		statusCode: {},

		success: xq.noop,

		traditional: false,

		type: 'GET',

		url: null

	};

	function _parseResult(xhr, dataType) {
		switch (dataType) {
			case 'text':
			case 'html':
				return xhr.responseText;
			case 'script':
				return xhr.responseText;
			case 'json':
				return xq.parseJSON(xhr.responseText);
			case 'xml':
				return xhr.responseXML;
		}
	}

	function _parseData(data, ops) {
		var type = ops.type.toLowerCase(),
			contentType = ops.contentType.toLowerCase(),
			querys = [];
		if (type === 'post' && contentType === CONTENT_TYPE_JSON) {
			if (xq.isString(data)) {
				return data;
			} else if (xq.isObject(data)) {
				return xq.stringify(data);
			}
		} else {
			if (xq.isString(data)) {
				return data;
			} else {
				xq.each(data, function(v, k) {
					querys.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
				});
				return querys.join('&');
			}
		}
	}

	function _ajax(ops) {
		var xhr = ops.xhr,
			error = ops.error,
			complete = ops.complete,
			success = ops.success,
			context = ops.context,
			charset = ops.charset,
			dataType = ops.dataType,
			dataFilter = ops.dataFilter,
			contentType = ops.contentType,
			statusCode = ops.statusCode || {},
			context = ops.context || xhr,
			type = ops.type.toLowerCase(),
			url = ops.url || '',
			datastr,
			isComplete = false;
		//设置前置任务
		if (ops.beforeSend) {
			ops.beforeSend.call(context, xhr);
		}
		//设置header
		xq.each(ops.headers, function(v, k) {
			xhr.setRequestHeader(k.replace(regHeadKeyClear, ''), v.replace(regHeadValueClear, ''));
		});

		datastr = _parseData(ops.data, ops);
		if (type === 'get') {
			url += (url.indexOf('?') > -1 ? '&' + datastr : '?' + datastr).replace(regClearAnd,'?').replace(regOneAnd,'&').replace(regRightAnd,'');
			data = '';

		}
		
		xhr.open(ops.type, url, ops.async, ops.username, ops.password);
		if(contentType){
			xhr.setRequestHeader('Content-Type',contentType + (charset ? '; '+charset : ''));
		}
		xhr.onreadystatechange = function() {
			var result;
			if (xhr.readyState === 4) {
				clearTimeout(clearId);
				if(isComplete) return;
				isComplete = true;
				if (xq.isFunction(statusCode[xhr.status])) {
					statusCode[xhr.status].call(context, xhr);
				}
				if (xhr.status === 200) {
					try {
						result = _parseResult(xhr, dataType);
					} catch (e) {
						error.call(context, xhr, e);
						complete.call(context, xhr, xhr.status);
						return;
					}
					if (xq.isFunction(dataFilter)) {
						result = dataFilter.call(context, result);
					}
					success.call(context, result, xhr);
					complete.call(context, xhr, xhr.status);
				} else {
					error.call(context, xhr);
					complete.call(context, xhr, xhr.status);
				}
			}
		};

		xhr.send(datastr);
		var clearId = setTimeout(function(){
			if(isComplete) return;
			isComplete = true;
			if(xq.isFunction(ops.error)){
				ops.error.call(ops.context);
			}
		},parseInt(ops.timeout)|| 30000);
		return xhr;
	}

	function _getScript(url,callback){
		var head = document.getElementsByTagName('head')[0],
			script = document.createElement('script');
		script.type = 'text/javascript';
		script.onload = script.onreadystatechange = function(){
			if(typeof script.readyState === 'undefined' || script.readyState === 'complete' || script.readyState === 'loaded'){
				script.onload = script.onreadystatechange = null;
				head.removeChild(script);
				script = head = null;
				callback && callback();
			}
		};
		script.src = url;
		head.appendChild(script);
	}

	var jsonpNumber = 0;
	function _jsonp(ops) {
		var callbackName = ops.jsonpCallback ? ops.jsonpCallback : ('xqjsonp' + (jsonpNumber++)+String(Math.random()).replace('.','')),
			isComplete = false,
			jsonp = ops.jsonp,
			datastr,clearId,
			url = ops.url;
		if(ops.jsonp){
			jsonp = ops.jsonp.replace('?',callbackName);
		}
		datastr = _parseData(ops.data,ops);
		url += ((url.indexOf('?') > -1 ? '&' + datastr : '?' + datastr) + '&' + jsonp).replace(regClearAnd,'?').replace(regOneAnd,'&').replace(regRightAnd,'');
		window[callbackName] = function(data){
			script.parentNode.removeChild(script);
			script = head = callbackName = window[callbackName] = undefined;
			clearTimeout(clearId);
			if(!isComplete && xq.isFunction(ops.success)){
				ops.success.call(ops.context,data);
			}
			isComplete = true;
		};

		var head = document.getElementsByTagName('head')[0],
			script = document.createElement('script');
		script.type = "text/javascript";
		script.src = url;
		head.appendChild(script);

		var clearId = setTimeout(function(){
			if(isComplete) return;
			isComplete = true;
			script.parentNode.removeChild(script);
			window[callbackName] = xq.noop;
			script = head = callbackName = undefined;
			if(xq.isFunction(ops.error)){
				ops.error.call(ops.context);
			}
		},parseInt(ops.timeout)|| 30000);
	}

	function _getConfig(newcfg) {
		newcfg = newcfg || {};
		return xq.extend(xq.extend({}, config), newcfg);
	}

	function ajax(url, ops) {

		if (xq.isObject(url)) {
			ops = url;
			url = null;
		}

		ops = _getConfig(ops);
		if (url) ops.url = url;
		if (ops.dataType === DATA_TYPE_JSONP) {
			_jsonp(ops);
		} else {
			if (!ops.xhr) {
				ops.xhr = _getxhr();
			}
			if(!ops.context) ops.context = ops.xhr;
			return _ajax(ops);
		}

	}
	xq.extend({
		ajax: ajax,
		get:function(url,data,callback,dataType){
			if(!xq.isObject(data)){
				type = callback;
				callback = data;
				data = null;
			}
			if(!xq.isFunction(callback)){
				return this;
			}
			return ajax({
				url:url,
				data:data,
				type:'get',
				dataType:dataType,
				success:callback
			});
		},
		post:function(url,data,callback,dataType){
			if(!xq.isObject(data)){
				type = callback;
				callback = data;
				data = null;
			}
			if(!xq.isFunction(callback)){
				return this;
			}
			return ajax({
				url:url,
				data:data,
				type:'post',
				dataType:dataType,
				success:callback
			});
		},
		getJSON:function(url,data,callback){
			if(!xq.isObject(data)){
				callback = data;
				data = null;
			}
			var jsonp;
			url = url.replace(regJsonpCallback,function(a){
				jsonp = a;
				return '';
			});
			return ajax({
				url:url,
				data:data,
				dataType:jsonp ? 'jsonp' : 'json',
				jsonp:jsonp,
				success:callback
			});
		},
		getScript:_getScript,
		ajaxSetup:function(ops){
			xq.extend(config,ops);
		}
	});

	xq.fn.extend({
		load:function(url,data,callback){
			if(!xq.isObject(data)){
				callback = data;
				data = null;
			}
			ajax({
				url:url,
				data:data,
				type:data ? 'post' : 'get',
				dataType:'html',
				context:this,
				success:function(html){
					this.each(function(el){
						xq(el).html(html);
					})
				}
			});
			return this;
		}
	});
}(window, document, xq);
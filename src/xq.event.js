/**
 *
 */
;!function(window, document, xq) {
    function _addEvent(el, type, handler) {
        if (el.addEventListener) {
            el.addEventListener(type, handler, false);
        } else if (el.attachEvent) {
            el.attachEvent('on' + type, handler);
        } else {
            el['on' + type] = handler;
        }
    }

    function _removeEvent(el, type, handler) {
        if (el.removeEventListener) {
            el.removeEventListener(type, handler);
        } else if (el.detachEvent) {
            el.detachEvent('on' + type, handler);
        } else {
            delete el['on' + type];
        }
    }
    var randomStr = new Date().getTime() +'_'+ function(l){
    	for(var i=0,s='';i<l;i++) s += (Math.random() * 36 | 0).toString(36);
        return s;
    }(10);
    function _bindEventParam(el,type,handler,selector){

        return {
            el:el,
            type:type,
            handler:handler,
            selector:selector
        };
    }
    function addEvent(el, type, handler,args,selector) {
        var handlers = el['handlers'+randomStr] || {};
        if (handlers[type]) {
            handlers[type].push({
                el:el,
                type:type,
                handler:handler,
                args:args,
                selector:selector
            });
        } else {
            handlers[type] = [{
                el:el,
                type:type,
                handler:handler,
                args:args,
                selector:selector
            }];
            el[type + '_handlers_'+randomStr] = function(e) {
                e = e || window.event;
                for (var i = 0, len = handlers[type].length; i < len; i++) {
                    handlers[type][i].apply(el, a);
                }
                each(handlers[type],function(o,i){

                });
            }
            el['handlers'+randomStr] = handlers;
            _addEvent(el, type, el[type + '_handlers_'+randomStr]);
        }
    }
    
    function removeEvent(el, type, handler) {
        var handlers = el['handlers'+randomStr] || {},
            index;
        if (handlers[type]) {
            if (handler) {
                index = xq.indexOf(handlers[type], handler);
                if (index > -1) handlers[type].splice(index, 1);
                if (!handlers[type].length) {
                    delete handlers[type];
                    _removeEvent(el, type, el[type + '_handlers_'+randomStr]);
                    delete el[type + '_handlers_'+randomStr];
                }
            } else {
                delete handlers[type];
                _removeEvent(el, type, el[type + '_handlers_'+randomStr]);
                delete el[type + '_handlers_'+randomStr];
            }
        }
    }

    function trigger(el, type, args) {
        var event;
        if(document.createEvent){
            event = document.createEvent('HTMLEvents');
            event.iniEvent(type,false,true);
            el.dispatchEvent(event);
        }else if(document.createEventObject){
            event = document.createEventObject();
            el.fireEvent(type,event);
        }
    }

    xq.fn.extend({
        on:function(type,selector,data,callback){
            if(!xq.isString(selector)){
                callback = data;
                data = selection;
                selection = null;
            }
            if(!xq.isObject(data)){
                callback = data;
                data = null;
                selection = null;
            }
            if(!xq.isFunction(callback)) return this;

        }
    })
}(window, document, xq);

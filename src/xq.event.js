/**
 * xq事件模块
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
    function _buildHandlersName(){
        return 'handlers'+randomStr;
    }
    function _buildHandlerName(type){
        return type + '_handlers_'+randomStr;
    }
    function _handlerIndexOf(handlers,handler,selector){
        var index = -1;
        if(selector){
            if(handler){
                each(handlers,function(o,i){
                    if(o.selector === selector){
                        index = i;
                        return true;
                    }
                })
            }else{
                each(handlers,function(o,i){
                    if(o.handler === handler && o.selector === selector){
                        index = i;
                        return true;
                    }
                });
            }
        }else{
            each(handlers,function(o){
                if(o.handler === handler){
                    index = i;
                    return true;
                }
            });
        }

        return index;
    }
    function _container(target,selector,parent){
        var nodes = oQuery(selector,parent);
        for(var i=0,l=nodes.length;i<l;i++){
            if(xq.container(target,nodes[i],parent)) return nodes[i];
        }
        return false;
    }
    function addEvent(el, type, handler,args,selector,isOne) {
        var handlersName = _buildHandlersName();
        var handlers = xq.data(el,handlersName) || {};
        if (handlers[type]) {
            handlers[type].push({
                el:el,
                type:type,
                handler:handler,
                args:args,
                selector:selector,
                isOne:isOne
            });
        } else {
            handlers[type] = [{
                el:el,
                type:type,
                handler:handler,
                args:args,
                selector:selector,
                isOne:isOne
            }];
            var handlerName = _buildHandlerName(type),
                eventHandler = function(e) {
                e = e || window.event;
                var args = xq.toArray(arguments),
                    target = e.srcElement || e.target,
                    node;
                xq.each(handlers[type],function(o,i){
                    o.args && (args = args.concat(o.args));
                    if(o.selector){
                        if(oQuery.matchesSelector(target,o.selector,o.el) || (node = _container(target,o.selector,o.el))){
                            node = node || target;
                            o.handler.apply(node,args);
                            if(o.isOne){
                                removeEvent(o.el,o.type,o.handler,o.selector);
                            }
                        }
                    }else{
                        o.handler.apply(o.el,args);
                        if(o.isOne){
                            removeEvent(o.el,o.type,o.handler,o.selector);
                        }
                    }
                });
            }
            xq.data(el,handlersName,handlers);
            xq.data(el,handlerName,eventHandler);
            _addEvent(el, type, eventHandler);
        }
    }
    
   

    function removeEvent(el, type, handler,selector) {
        var handlers = xq.data(el,_buildHandlersName()) || {},
            index,
            handlerName = _buildHandlerName(type),
            eventHandler = xq.data(el,handlerName);
        if (handlers[type]) {
            if (handler) {
                index = _handlerIndexOf(handlers[type], handler,selector);
                if (index > -1) handlers[type].splice(index, 1);
                //当监听器为空时，删除事件句柄
                if (!handlers[type].length) {
                    delete handlers[type];
                    _removeEvent(el, type, eventHandler);
                    xq.removeData(el,handlerName);
                }
            } else {
                delete handlers[type];
                _removeEvent(el, type, eventHandler);
                xq.removeData(el,handlerName);
            }
        }
    }

    function trigger(el, type) {
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
        on:function(type,selector,data,handler,isOne){
            if(xq.isFunction(data)){
                handler = data;
                if(xq.isArray(selector)){
                    data = selector;
                    selector = null;
                }else if(xq.isString(selector)){
                    data = null;
                }else{
                    data = selector = null;
                }
            }
            if(xq.isFunction(selector)){
                handler = selector;
                data = selector = null;
            }
            if(!xq.isFunction(handler)){
                throw 'The arguments have no function';
            }

            if(!xq.isFunction(handler)) return this;
            this.each(function(el){
                addEvent(el,type,handler,data,selector,isOne);
            });
            return this;
        },
        off:function(type,selector,handler){
            if(xq.isFunction(selector)){
                handler = selector;
                selector = null;
            }
            this.each(function(el){
                removeEvent(el,type,handler,selector);
            });
            return this;
        },
        trigger:function(type){
            this.each(function(el){
                trigger(el,type);
            });
            return this;
        },
        bind:function(type,data,fn){
            return this.on(type,null,data,fn);
        },
        one:function(type,data,fn){
            return this.on(type,null,data,fn,true);
        },
        unbind:function(type,fn){
            return this.off(type,null,fn);
        },
        live:function(type,data,fn){
            addEvent(document.documentElement,type,fn,data,this.selector);
            return this;
        },
        die:function(type,fn){
            removeEvent(document.documentElement,type,fn,this.selector);
            return this;
        },
        delegate:function(selector,type,data,fn){
            return this.on(type,selector,data,fn);
        },
        undelegate:function(selector,type,fn){
            return this.off(type,selector,fn);
        }
    })
}(window, document, xq);

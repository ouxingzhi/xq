! function(window, document, undefined) {
    //简单的选择器正则
    var sreg = /^(?:([a-z\*]{1}\w*)|(?:#([a-z]\w*)))$/i,
        //复杂选择器正则
        selreg = /^([a-z\*]{1}\w*)?(?:#([a-z][\w-]*))?((?:\.[a-z][\w-]*)+)?((?:\[["']?[a-z][\w-]*["']?(?:[\^\$\*\|~|\!]?=["']?[a-z][\w-]*)?["']?\])+)?(?:\:([a-z][\w-]*[a-z])(?:\((.+)\))?)?$/im,
        //层级关系正则
        tierreg = /(?!\([^\)]*)(?:\s|\~(?!=)|\+|>)(?![^\(]*\))/img,
        //首尾空格正则
        trimreg = /^\s+|\s+$/mg,
        //过滤层级关系中的多余空格正则
        blankreg = /\s*\+\s*|\s*\~\s*(?!=)|\s*>\s*/mg,
        //类获取正则
        clsreg = /\.([a-z][\w-]*)/img,
        //属性获取正则
        attrreg = /\[(?:["']?([a-z][\w-]*)["']?)(?:([\^\$\*\|~|\!]?=)["']?([a-z][\w-]*)["']?)?\]/img,
        //空格
        blank2reg = /\s+/m,
        //全局空格
        blank3reg = /\s+/mg,
        //逗号
        dotreg = /(?!\([^\)]+)\s*,\s*(?![^\(]+\))/,
        //标题元素
        headerreg = /h1|h2|h3|h4|h5|h6/i,
        //表单元素
        inputreg = /input|select|textarea|button/i,
        //nth-child 参数捕捉
        notchildreg = /^(?:(\d+)|(?:(\d+)n(?:([\+-])(\d+))?)|(odd|even)|(n))$/i,
        qk = parseInt(Math.random() * 10000);

    function indexOf(arr,value){
        if(!arr) return -1;
        if(arr.indexOf) return arr.indexOf(value);
        var index = -1;
        each(arr,function(v,i){
            if(value === v){
                index = i;
                return true;
            }
        });
        return index;
    }    

    function indexOfE(el, fa, tag) {
        var i = -1,sel = el;
        dir = fa ? 'nextSibling' : 'previousSibling';
        if (typeof sel[dir + 'index'] !== 'undefined') return sel[dir + 'index'];
        do{
            if(el.nodeType === 1){
                if(tag){
                    if(tag === el.nodeName)i++;
                }else{
                    i++;
                }
                
            } 
        }while(el = el[dir]);

        sel[dir + 'index'] = i;
        return i;
    }

    function getCurStyle(el, stylename) {
        if (el.currentStyle) {
            return el.currentStyle[stylename];
        } else {
            return document.defaultView.getComputedStyle(el, false)[stylename];
        }
    }

    var ap = Array.prototype,
        push = ap.push,
        slice = ap.slice,
        toStr = Object.prototype.toString,
        index = 1000,
        useAmethod = function() {
            try {
                var d = document.createElement('div');
                d.innerHTML = '<p></p>';
                push.call(d);
                return true;
            } catch (e) {
                return false;
            }
        }(),
        expando = 'oquery' + (+new Date()) + String(Math.random()).replace('.','');

    function isArray(o) {
        return toStr.call(o).toLowerCase() === '[object array]';
    }

    function each(l, f, s) {
        for (var i = 0, len = l.length; i < len; i++) {
            if (f.call(s, l[i], i, l)) return;
        }
    }

    function lastEach(l, f, s) {
        for (var i = l.length; --i > -1;) {
            if (f.call(s, l[i], i, l)) return;
        }
    }
    /**
     * oQuery选择器入口
     * @param selection {String} 传入选择器字符串
     * @param rootNode {Node} 选择器查找相对根节点，不传默认为document
     * @return {Array} 返回查询结果
     */

    function oQuery(selection, rootNode) {
        return new oQuery.fn.init(selection, rootNode);
    }
    oQuery.fn = oQuery.prototype = {
        constructor: oQuery,
        init: function(selection, rootNode) {
            var d, t, ret = [];
            rootNode = rootNode || document;
            //简单表达式处理
            if (d = sreg.exec(selection)) {
                if (d[1]) {
                    var l = rootNode.getElementsByTagName(d[1]);
                    useAmethod ? push.apply(ret, l) : each(l, function(v) {
                        ret.push(v);
                    });
                    return l;
                } else if (d[2]) {
                    t = document.getElementById(d[2]);
                    t && ret.push(t);
                    return ret;
                }
                //复杂表达式处理
            } else {
                if (rootNode.querySelectorAll && false) {
                    //调用原生方法
                    try {
                        return push.apply(ret, rootNode.querySelectorAll(selection)), ret;
                    } catch (e) {
                        //报错调用oQuery自己的选择器
                        return this.querySelectorAll(selection, rootNode);
                    }
                } else {
                    //但不支持querySelectorAll，调用oQuery自身的选择器
                    return this.querySelectorAll(selection, rootNode);
                }
            }
        },
        
        querySelectorAll: function(selection, rootNode) {
            var result = [];
            //解析选择器，得到解析列表
            var ls = this.parseMultiSelector(selection);
            each(ls, function(tiers) {
                var res = this.queryNodes(tiers, rootNode);
                each(res, function(n) {
                    if (!this.isExist(result, n)) {
                        result.push(n);
                        this.setTag(result, n);
                    }
                }, this);
            }, this);
            result = this.sort(result,rootNode);
            return result;
        },
        //排序
        sort:function(list,root){
            root = root || document
            var all = root.getElementsByTagName('*');
            each(all,function(d,i){
                d[expando] = i;
            });
            var arr = [];
            each(list,function(d){
                var n = new Number(d[expando]);
                n.el = d;
                arr.push(n);
            });
            arr.sort(function(a,b){
                return a.valueOf() - b.valueOf();
            });
            var res = [];
            each(arr,function(i){
                res.push(i.el);
            });
            return res;
        },
        //迭代查询
        queryNodes: function(tiers, rootNode) {
            var i, op, tier, result = rootNode;
            for (i = 0; i < tiers.length; i += 2) {
                op = tiers[i];
                tier = tiers[i + 1];
                if (!tier) return [];
                result = this.ops[op].call(this, tier, result);
            }
            return result;
        },
        //解析css选择器
        parseMultiSelector: function(sel) {
            var selections = sel.split(dotreg),
                ls = [];
            for (var i = 0; i < selections.length; i++) {
                var selection = selections[i];
                var str = selection.replace(blankreg, function(a) {
                    return a.replace(blank3reg, '');
                }).replace(trimreg, '').replace(blank3reg, ' ');
                var sels = str.split(tierreg),
                    ops = [];
                str.replace(tierreg, function(op) {
                    ops.push(op);
                });
                var tiers = [];
                for (var t = 0; t < sels.length; t++) {
                    tiers.push(this.parseSelector(sels[t]));
                    if (ops[t]) tiers.push(ops[t]);
                }
                tiers[0] ? tiers.unshift(' ') : tiers.shift();
                ls.push(tiers);
            }
            return ls;
        },
        parseSelector: function(selection) {
            if (!selection) return null;
            var m = selreg.exec(selection);
            return {
                tagname: m[1],
                id: m[2],
                cls: this.getClass(m[3]),
                attrs: this.getAttrs(m[4]),
                pseudo: m[5],
                pseudoAttr: m[6]
            }
        },
        getClass: function(str) {
            var cls = [];
            if (!str) return cls;
            str.replace(clsreg, function(a, b) {
                b.replace('.', '');
                cls.push(b);
            });
            return cls;
        },
        getAttrs: function(str) {
            var attrs = [];
            if (!str) return attrs;
            str.replace(attrreg, function(a, b, c, d) {
                attrs.push({
                    name: b,
                    op: c,
                    value: d
                });
            });
            return attrs;
        },
        isExist: function(list, node) {
            var tag = node['data-tag' + qk];
            if (tag) {
                return !!list[tag];
            }
            return false;
        },
        setTag: function(list, node) {
            var tag = node['data-tag' + qk];
            if (!tag) {
                tag = 'i'+index++;
                node['data-tag' + qk] = tag;
            }
            list[tag] = true;
        },
        ops: {
            ' ': function(tier, rootNode) {
                var i, result = [];
                isArray(rootNode) || (rootNode = [rootNode]);
                each(rootNode, function(node) {
                    each(this.scanDescend(tier, node), function(v) {
                        if (!this.isExist(result, v)) {
                            result.push(v);
                            this.setTag(result, v);
                        }
                    }, this);
                }, this);
                return result;
            },
            '>': function(tier, rootNode) {
                var i, result = [];
                isArray(rootNode) || (rootNode = [rootNode]);
                each(rootNode, function(node) {
                    each(this.scanDescend(tier, node, true), function(v) {
                        if (!this.isExist(result, v)) {
                            result.push(v);
                            this.setTag(result, v);
                        }
                    }, this)
                }, this);
                return result;
            },
            '+': function(tier, rootNode) {
                var i, result = [];
                isArray(rootNode) || (rootNode = [rootNode]);
                each(rootNode, function(node) {
                    each(this.scanNextSibling(tier, node), function(v) {
                        if (!this.isExist(result, v)) {
                            result.push(v);
                            this.setTag(result, v);
                        }
                    }, this)
                }, this);
                return result;
            },
            '~': function(tier, rootNode) {
                var i, result = [];
                isArray(rootNode) || (rootNode = [rootNode]);
                each(rootNode, function(node, i) {
                    var nodes = [];
                    nodes = this.scanSibling(tier, node,result);

                    nodes = this.filter(tier, nodes);
                    push.apply(result, nodes);
                }, this);
                return result;
            }
        },

        scanDescend: function(tier, rootNode, notSub) {
            var result = [];
            if (notSub) {
                each(rootNode.childNodes, function(node) {
                    if (this.checkTier(tier, node)) {
                        result.push(node);
                    }
                }, this);
            } else {
                var node;
                if (tier.id && rootNode.getElementById) {
                    node = rootNode.getElementById(tier.id);
                    if (node && this.checkTier(tier, node)) {
                        result.push(node);
                    }
                } else if (tier.cls && tier.cls.length && rootNode.getElementsByClassName) {
                    each(tier.cls, function(v) {
                        each(rootNode.getElementsByClassName(v), function(v) {
                            if (!this.isExist(result, v) && this.checkTier(tier, v)) {
                                result.push(v);
                                this.setTag(result, v);
                            }
                        }, this);
                    }, this);
                } else {
                    node = rootNode.getElementsByTagName(tier.tagname || '*') || [];
                    each(node, function(v) {
                        if (this.checkTier(tier, v)) {
                            result.push(v);
                        }
                    }, this);
                }
            }
            result = this.filter(tier, result);
            return result;
        },
        scanNextSibling: function(tier, node) {
            var result = [];
            while (node = node.nextSibling) {
                if (node.nodeType === 1) {
                    if (this.checkTier(tier, node)) result.push(node);
                    return result;
                }
            };
            return result;
        },
        scanSibling: function(tier, node,oresult) {
            var result = [];
            while (node = node.nextSibling) {
                if (node.nodeType === 1 && !this.isExist(oresult, node) && this.checkTier(tier, node)){
                    result.push(node);
                    this.setTag(oresult,node);
                }
            }
            return result;
        },
        checkTier: function(tier, node) {
            if (tier.id && tier.id !== node.id) {
                return false;
            }
            if (tier.cls && tier.cls.length && !this.checkCls(tier.cls, node)) {
                return false;
            }
            if (tier.attrs && tier.attrs.length && !this.checkAttrs(tier.attrs, node)) {
                return false;
            }
            if (tier.tagname && tier.tagname.toLowerCase() !== node.nodeName.toLowerCase() && tier.tagname.toLowerCase() !== '*') {
                return false;
            }
            /*if(tier.pseudo && !this.checkPseudo(tier.pseudo,tier.pseudoAttr,node)){
                return false;
            }*/
            return true;
        },
        checkCls: function(cls, node) {
            if (!node.className) return false;
            var cmap = {};
            each(node.className.split(blank2reg), function(v) {
                cmap[v] = {};
            });
            for (var i = 0; i < cls.length; i++) {
                if (!cmap[cls[i]]) return false;
            }
            return true;
        },
        filter: function(tier, array, presult) {
            if (tier.pseudo) {
                var result = [];
                each(array, function(v, i, l) {
                    if (!presult) {
                        if (this.checkPseudo(tier.pseudo, tier.pseudoAttr, v, i, l)) {
                            result.push(v);
                        }
                    } else {
                        if (!this.isExist(presult, v) && this.checkPseudo(tier.pseudo, tier.pseudoAttr, v, i, l)) {
                            result.push(v);
                            this.setTag(presult, v);
                        }
                    }
                }, this);
                return result;
            }
            return array;
        },
        checkAttrs: function(attrs, node) {
            var attr, r;
            for (var i = 0; i < attrs.length; i++) {
                attr = attrs[i];
                if (!attr.op) {
                    r = this.getAttr(attr.name, node);
                    if (!r) return false;
                } else {
                    var op = attr.op;
                    if (!this.attrop[op]) return false;
                    r = this.attrop[op].call(this, attr.name, attr.value, node);
                    if (!r) return false;
                }
            }
            return true;
        },
        checkPseudo: function(pseudo, pseudoAttr, node, i, array) {
            if (!this.pseudes[pseudo]) return false;
            return this.pseudes[pseudo].call(this, pseudo, pseudoAttr, node, i, array);
        },
        attrop: {
            '=': function(name, value, node) {
                return this.getAttr(name, node) === value;
            },
            '~=': function(name, value, node) {
                var nval = this.getAttr(name, node);
                if (!nval) return false;
                return RegExp('(?:^|\\s+)' + value + '(?:$|\\s+)').test(nval);
            },
            '^=': function(name, value, node) {
                var nval = this.getAttr(name, node);
                if (!nval) return false;
                return RegExp('^' + value).test(nval);
            },
            '$=': function(name, value, node) {
                var nval = this.getAttr(name, node);
                if (!nval) return false;
                return RegExp(value + '$').test(nval);
            },
            '*=': function(name, value, node) {
                var nval = this.getAttr(name, node);
                if (!nval) return false;
                return RegExp(value).test(nval);
            },
            '|=': function(name, value, node) {
                var nval = this.getAttr(name, node);
                if (!nval) return false;
                return RegExp(value + '(?:$|-)').test(nval);
            },
            '!=': function(name, value, node) {
                var nval = this.getAttr(name, node);
                if (!nval) return false;
                return value !== nval;
            }
        },
        getAttr: function(name, node) {
            if (name === 'class') return node.className;
            return node.getAttribute(name);
        },
        pseudes: {
            'first': function(pseudo, pseudoAttr, node, i) {
                return i === 0;
            },
            'last': function(pseudo, pseudoAttr, node, i, array) {
                return i === array.length - 1;
            },
            'not': function(pseudo, param, node) {
                var tier = this.parseMultiSelector(param)[0][1];
                return !this.checkTier(tier, node);
            },
            'even': function(pseudo, param, node, i) {
                return i % 2;
            },
            'odd': function(pseudo, param, node, i) {
                return !(i % 2);
            },
            'eq': function(pseudo, param, node, i) {
                return i === parseInt(param);
            },
            'gt': function(pseudo, param, node, i) {
                return i > parseInt(param);
            },
            'lt': function(pseudo, param, node) {
                return i < parseInt(param);
            },
            'header': function(pseudo, param, node) {
                return headerreg.test(node.nodeName);
            },
            'focus': function(pseudo, param, node) {
                return document.activeElement === node;
            },
            'contains': function(pseudo, param, node) {
                return node.innerText.indexOf(param) > -1;
            },
            'empty': function(pseudo, param, node) {
                return !node.firstChild;
            },
            'has': function(pseudo, param, node) {
                var tier = this.parseMultiSelector(param)[0][1];
                return this.checkTier(tier, node);
            },
            'parent': function(pseudo, param, node) {
                return !!node.firstChild;
            },
            'hidden': function(pseudo, param, node) {
                return getCurStyle(node, 'display') === 'none';
            },
            'visible': function(pseudo, param, node) {
                return getCurStyle(node, 'display') !== 'none';
            },
            'nth-child': function(pseudo, param, node, i, array, dir, tag) {
                var index = indexOfE(node, dir, tag) + 1,
                    m = notchildreg.exec(param),
                    pos;
                if (m[1]) {
                    return index === parseInt(m[1]);
                } else if (m[2]) {
                    pos = parseInt(m[3] + m[4] || 0);

                    if (pos === index) return true;
                    if (index < pos) return false;
                    return !((index - pos) % m[2]);

                } else if (m[5]) {
                    return m[5] === 'odd' ? index % 2 : !(index % 2);
                } else if (m[6]) {
                    return true;
                }
            },
            'first-child': function(pseudo, param, node) {
                var first;
                each(node.parentNode.childNodes, function(n) {
                    if (n.nodeType === 1) {
                        first = n;
                        return true;
                    }
                });
                return first === node;
            },
            'last-child': function(pseudo, param, node) {
                var first;
                lastEach(node.parentNode.childNodes, function(n) {
                    if (n.nodeType === 1) {
                        first = n;
                        return true;
                    }
                });
                return first === node;
            },
            'only-child': function(pseudo, param, node) {
                var node = node.parentNode.firstChild,
                    i = 0;
                if (node.nodeType === 1) i++;
                while (node = node.nextSibling) {
                    if (node.nodeType === 1) {
                        i++;
                        if (i > 1) return false;
                    }
                }
                return true;
            },
            'only-of-type': function(pseudo, param, node) {
                var tagname = node.nodeName,
                    i = 0,
                    node = node.parentNode.firstChild;

                do {
                    if (node.nodeType === 1 && tagname === node.nodeName) {
                        i++;
                        if (i > 1) return false;
                    }
                } while (node = node.nextSibling);
                return true;
            },
            'first-of-type': function(pseudo, param, node) {
                var i = 0,
                    n = node.parentNode.firstChild;

                do {
                    if (n.nodeType === 1 && node.nodeName === n.nodeName) {
                        i++;
                        if (i === 1 && node === n) return true;
                        if (i > 1) return false;
                    }
                } while (n = n.nextSibling);
                return false;
            },
            'last-of-type': function(pseudo, param, node) {
                var i = 0,
                    n = node.parentNode.lastChild;

                do {
                    if (n.nodeType === 1 && node.nodeName === n.nodeName) {
                        i++;
                        if (i === 1 && node === n) return true;
                        if (i > 1) return false;
                    }
                } while (n = n.previousSibling);
                return false;
            },
            'nth-of-type': function(pseudo, param, node, i, array) {
                return this.pseudes['nth-child'].call(this, pseudo, param, node, i, array, false, node.nodeName);
            },
            'nth-last-of-type': function(pseudo, param, node, i, array) {
                return this.pseudes['nth-child'].call(this, pseudo, param, node, i, array, true, node.nodeName);
            },
            'input': function(pseudo, param, node) {
                return inputreg.test(node.nodeName);
            },
            'text': function(pseudo, param, node) {
                return node.nodeName === 'INPUT' && (node.type === 'text' || node.type === '');
            },
            'password': function(pseudo, param, node) {
                return node.nodeName === 'INPUT' && node.type === 'password';
            },
            'radio': function(pseudo, param, node) {
                return node.nodeName === 'INPUT' && node.type === 'radio';
            },
            'checkbox': function(pseudo, param, node) {
                return node.nodeName === 'INPUT' && node.type === 'checkbox';
            },
            'submit': function(pseudo, param, node) {
                return node.nodeName === 'INPUT' && node.type === 'submit';
            },
            'image': function(pseudo, param, node) {
                return node.nodeName === 'INPUT' && node.type === 'image';
            },
            'reset': function(pseudo, param, node) {
                return node.nodeName === 'INPUT' && node.type === 'reset';
            },
            'button': function(pseudo, param, node) {
                return node.nodeName === 'INPUT' && node.type === 'button' || node.nodeName === 'BUTTON';
            },
            'file': function(pseudo, param, node) {
                return node.nodeName === 'INPUT' && node.type === 'file';
            },
            'hidden': function(pseudo, param, node) {
                return node.nodeName === 'INPUT' && node.type === 'hidden';
            },
            'enabled': function(pseudo, param, node) {
                return inputreg.test(node.nodeName) && !node.disabled
            },
            'disabled': function(pseudo, param, node) {
                return inputreg.test(node.nodeName) && !! node.disabled
            },
            'checked': function(pseudo, param, node) {
                return node.nodeName === 'INPUT' && !! node.checked;
            },
            'selected': function(pseudo, param, node) {
                return node.nodeName === 'OPTION' && !! node.selected;
            }
        }
    };
    oQuery.fn.init.prototype = oQuery.fn;
    if (typeof define === 'function' && define.amd) {
        define('oquery', [], function() {
            return oQuery;
        });
    }
    window.oQuery = oQuery;

    function _checkTiers(tiers,node){
        var r;
        for(var i=0,l=tiers.length;i<l;i++){
            r=oQuery.fn.checkTier(tiers[i][1],node);
            if(!r) return false;
            r=oQuery.fn.filter(tiers[i][1],[node]);
            if(r.length > 0) return true;
        }
        return false;
    }
    var roothtml = document.documentElement,
        matchesfun = roothtml.matchesSelector || roothtml.webkitMatchesSelector || roothtml.mozMatchesSelector || roothtml.msMatchesSelector;
    oQuery.matchesSelector = function(node,selector,rootnode){
        if(matchesfun){
            return matchesfun.call(node,selector);
        }else{
            rootnode = rootnode || document;
            var tiers = oQuery.fn.parseMultiSelector(selector);
            var isMultiple = false;
            each(tiers,function(v){
                if(v.length > 2){
                    isMultiple = true;
                    return true;
                }
            });
            if(isMultiple){
                return indexOf(oQuery(selector,rootnode),node) !== -1;
            }else{
                return _checkTiers(tiers,node);
            }
        }
    }



}(window, document);


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
		val:function(el,val){
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
/**
 * xqFramework DOMģ��
 */
;!function(window,document,xq){
	var dom = document.createElement('div');
	function strToDom(str){
		dom.innerHTML = str;
		var box = document.createDocumentFragment();
		var el = dom.firstChild;
		while(el){
			box.appendChild(el);
			el = el.nextSibling;
		}
		return box;
	}
	/*
	 * ����Ԫ��
	 */
	function _append(el,child,prepend,fc){
		if(xq.isXqObject(child)){
			child.each(function(c){
				_append(el,c,prepend,prepend && el.firstChild);
			});
		}else if(xq.isElement(child)){
			if(prepend && fc){
				el.insertBefore(child,fc);
			}else{
				el.appendChild(child);
			}
		}else if(xq.isString(child)){
			var child = xq(child);
			_append(el,child,prepend);
		}
	}
	function _after(ela,elb){
		
		if(xq.isXqObject(elb)){
			if(ela.nextSibling){
				elb.each(function(c){
					_after(ela,c);
				});
			}else{
				var parent = ela.parentNode;
				elb.each(function(c){
					parent.appendChild(c);
				});
			}
		}else if(xq.isElement(elb)){
			if(ela.nextSibling){
				ela.parentNode.insertBefore(elb,ela.nextSibling);
			}else{
				ela.parentNode.appendChild(elb);
			}
		}else if(xq.isString(elb)){
			var elb = xq(elb);
			_after(el,elb);
		}
	}
	function _before(ela,elb){
		ela.parentNode.insertBefore(elb,ela);

		if(xq.isXqObject(elb)){
			elb.each(function(c){
				_before(ela,c);
			});
		}else if(xq.isElement(elb)){
			ela.parentNode.insertBefore(elb,ela);
		}else if(xq.isString(elb)){
			var elb = xq(elb);
			_after(el,elb);
		}
	}
	xq.fn.extend({
		append:function(content){
			this.each(function(el){
				_append(el,content);
			});
			return this;
		},
		appendTo:function(content){
			xq(content).append(this);
			return this;
		},
		prepend:function(content){
			this.each(function(el){
				_append(el,content,true,el.firstChild);
			});
			return this;
		},
		prependTo:function(content){
			xq(content).prepend(this);
			return this;
		},
		after:function(content){
			this.each(function(el){
				_after(el,content);
			});
			return this;
		},
		before:function(content){
			this.each(function(el){
				_before(el,content);
			});
			return this;
		},
		wrap:function(html){
			var box = xq(html);
			box.append(this);
			return this;
		},
		unwrap:function(){
			this.each(function(el){
				xq.each(el && el.childNodes||[],function(c){
					el.parentNode.insertBefore(c,el);
				});
				el && el.parentNode.removeChild(el);
			});
			return this;
		},
		empty:function(){
			this.each(function(el){
				el.innerHTML = '';
			});
			return this;
		},
		remove:function(expr){
			this.each(function(el,i,self){
				if(!expr || xq.matches(el,expr)){
					self.__delIdent(el);
					xq.removeData(el);
					el && el.parentNode.removeChild(el);
				}
			});
			return this;
		},
		detach:function(expr){
			return this.remove(exper);
		},
		clone:function(copyEvent){
			var tmp = xq();
			this.each(function(el){
				if(el.cloneNode){
					tmp.push(el.cloneNode(copyEvent));
				}else{
					tmp.push(el);
				}
			})
			return tmp;
		}
	});
}(window,document,xq);
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
    var randomStr = new Date().getTime() + '_' + function(l) {
            for (var i = 0, s = ''; i < l; i++) s += (Math.random() * 36 | 0).toString(36);
            return s;
        }(10);

    function _bindEventParam(el, type, handler, selector) {

        return {
            el: el,
            type: type,
            handler: handler,
            selector: selector
        };
    }

    function _buildHandlersName() {
        return 'handlers' + randomStr;
    }

    function _buildHandlerName(type) {
        return type + '_handlers_' + randomStr;
    }

    function _handlerIndexOf(handlers, handler, selector) {
        var index = -1;
        if (selector) {
            if (handler) {
                each(handlers, function(o, i) {
                    if (o.selector === selector) {
                        index = i;
                        return true;
                    }
                })
            } else {
                each(handlers, function(o, i) {
                    if (o.handler === handler && o.selector === selector) {
                        index = i;
                        return true;
                    }
                });
            }
        } else {
            each(handlers, function(o) {
                if (o.handler === handler) {
                    index = i;
                    return true;
                }
            });
        }

        return index;
    }

    function _container(target, selector, parent) {
        var nodes = oQuery(selector, parent);
        for (var i = 0, l = nodes.length; i < l; i++) {
            if (xq.container(target, nodes[i], parent)) return nodes[i];
        }
        return false;
    }

    function addEvent(el, type, handler, args, selector, isOne) {
        var handlersName = _buildHandlersName();
        var handlers = xq.data(el, handlersName) || {};
        if (handlers[type]) {
            handlers[type].push({
                el: el,
                type: type,
                handler: handler,
                args: args,
                selector: selector,
                isOne: isOne
            });
        } else {
            handlers[type] = [{
                el: el,
                type: type,
                handler: handler,
                args: args,
                selector: selector,
                isOne: isOne
            }];
            var handlerName = _buildHandlerName(type),
                eventHandler = function(e) {
                    e = e || window.event;
                    var args = xq.toArray(arguments),
                        target = e.srcElement || e.target,
                        node;
                    xq.each(handlers[type], function(o, i) {
                        o.args && (args = args.concat(o.args));
                        if (o.selector) {
                            if (oQuery.matchesSelector(target, o.selector, o.el) || (node = _container(target, o.selector, o.el))) {
                                node = node || target;
                                o.handler.apply(node, args);
                                if (o.isOne) {
                                    removeEvent(o.el, o.type, o.handler, o.selector);
                                }
                            }
                        } else {
                            o.handler.apply(o.el, args);
                            if (o.isOne) {
                                removeEvent(o.el, o.type, o.handler, o.selector);
                            }
                        }
                    });
                }
            xq.data(el, handlersName, handlers);
            xq.data(el, handlerName, eventHandler);
            _addEvent(el, type, eventHandler);
        }
    }



    function removeEvent(el, type, handler, selector) {
        var handlers = xq.data(el, _buildHandlersName()) || {},
            index,
            handlerName = _buildHandlerName(type),
            eventHandler = xq.data(el, handlerName);
        if (handlers[type]) {
            if (handler) {
                index = _handlerIndexOf(handlers[type], handler, selector);
                if (index > -1) handlers[type].splice(index, 1);
                //当监听器为空时，删除事件句柄
                if (!handlers[type].length) {
                    delete handlers[type];
                    _removeEvent(el, type, eventHandler);
                    xq.removeData(el, handlerName);
                }
            } else {
                delete handlers[type];
                _removeEvent(el, type, eventHandler);
                xq.removeData(el, handlerName);
            }
        }
    }

    function trigger(el, type) {
        var event;
        if (document.createEvent) {
            event = document.createEvent('HTMLEvents');
            event.iniEvent(type, false, true);
            el.dispatchEvent(event);
        } else if (document.createEventObject) {
            event = document.createEventObject();
            el.fireEvent(type, event);
        }
    }

    xq.fn.extend({
        on: function(type, selector, data, handler, isOne) {
            if (xq.isFunction(data)) {
                handler = data;
                if (xq.isArray(selector)) {
                    data = selector;
                    selector = null;
                } else if (xq.isString(selector)) {
                    data = null;
                } else {
                    data = selector = null;
                }
            }
            if (xq.isFunction(selector)) {
                handler = selector;
                data = selector = null;
            }
            if (!xq.isFunction(handler)) {
                throw 'The arguments have no function';
            }

            if (!xq.isFunction(handler)) return this;
            this.each(function(el) {
                addEvent(el, type, handler, data, selector, isOne);
            });
            return this;
        },
        off: function(type, selector, handler) {
            if (xq.isFunction(selector)) {
                handler = selector;
                selector = null;
            }
            this.each(function(el) {
                removeEvent(el, type, handler, selector);
            });
            return this;
        },
        trigger: function(type) {
            this.each(function(el) {
                trigger(el, type);
            });
            return this;
        },
        bind: function(type, data, fn) {
            return this.on(type, null, data, fn);
        },
        one: function(type, data, fn) {
            return this.on(type, null, data, fn, true);
        },
        unbind: function(type, fn) {
            return this.off(type, null, fn);
        },
        live: function(type, data, fn) {
            addEvent(document.documentElement, type, fn, data, this.selector);
            return this;
        },
        die: function(type, fn) {
            removeEvent(document.documentElement, type, fn, this.selector);
            return this;
        },
        delegate: function(selector, type, data, fn) {
            return this.on(type, selector, data, fn);
        },
        undelegate: function(selector, type, fn) {
            return this.off(type, selector, fn);
        }
    });

    
    var readyHandlers = [],
        isReady = false;

    function runReady() {
        isReady = true;
        xq.each(readyHandlers, function(fn) {
            fn();
        });
        readyHandlers = null;
        runReady = xq.noop;

    }

    if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', runReady)
    } else {
        var html = document.getElementsByTagName('html')[0];
        (function loop() {
            try {
                html.doScroll('up');
                runReady();
                html = null;
            } catch (e) {
                setTimeout(loop, 20);
            }
        })();
    }
    xq.extend({
        /**
         * 添加页面DOM准备完成时的回调
         * @method ready
         * @static
         * @param fn {Function} 
         */
        ready: function(fn) {
            if(!xq.isFunction(fn)) return;
            if (isReady) {
                fn();
            } else {
                readyHandlers.push(fn);
            }
        }
    });


}(window, document, xq);

/**
 * xqFramework 筛选相关方法
 */
;!function(window,document,xq){
	function _next(el){
		while(el = el.nextSibling){
			if(el.nodeType === 1) return el;
		}
		return null;
	}
	function _pre(el){
		while(el = el.previousSibling){
			if(el.nodeType === 1) return el;
		}
		return null;
	}
	
	xq.fn.extend({
		hasClass:function(cls){
			var tmp = xq(),
				reg = RegExp('[\\^\\s]'+cls+'[\\$\\s]');
			this.each(function(el){
				if(el && reg.test(el.className)){
					tmp.push(el);
				}
			});
			return tmp;
		},
		filter:function(expr){
			var handler;
			var tmp = xq();
			if(xq.isFunction(expr)){
				handler = function(el){
					return expr(el);
				}
			}else if(xq.isString(expr)){
				handler = function(el){
					return xq.matches(el,exper);
				}
			}else{
				return tmp;
			}
			
			this.each(function(el){
				if(handler(el)){
					tmp.push(el);
				}
			});
			return tmp;
		},
		is:function(expr){
			var tmp = false;
			if(xq.isFunction(expr)){
				handler = function(el){
					return expr(el);
				}
			}else if(xq.isString(expr)){
				handler = function(el){
					return xq.matches(el,exper);
				}
			}else{
				return tmp;
			}
			this.each(function(el){
				if(handler(el)){
					return tmp = true;
				}
			});
			return tmp;
		},
		has:function(expr){
			var tmp = xq();
			this.each(function(el){
				if(xq(el).find(expr).length){
					tmp.push(el);
				}
			});
			return tmp;
		},
		not:function(expr){
			var handler;
			var tmp = xq();
			if(xq.isFunction(expr)){
				handler = function(el){
					return expr(el);
				}
			}else if(xq.isString(expr)){
				handler = function(el){
					return xq.matches(el,exper);
				}
			}else{
				return tmp;
			}
			
			this.each(function(el){
				if(!handler(el)){
					tmp.push(el);
				}
			});
			return tmp;
		},
		children:function(expr){
			var tmp = xq();
			this.each(function(el){
				xq.each(el.childNodes,function(el){
					if(!expr || xq.matches(el,expr)){
						tmp.push(el)
					}
				});
			});
			return tmp;
		},
		closest:function(expr){
			var handler;
			var tmp = xq();
			if(xq.isFunction(expr)){
				handler = function(el){
					return expr(el);
				}
			}else if(xq.isString(expr)){
				handler = function(el){
					return xq.matches(el,exper);
				}
			}else{
				return tmp;
			}
			this.each(function(el){
				do{
					if(el && handler(el)){
						tmp.push(el);
						return ;
					}
				}while(el = el.parentNode);
			});
			return tmp;
		},
		find:function(expr){
			var tmp = xq();
			this.each(function(el){
				tmp.push(xq(expr,el));
			});	
			return tmp;
		},
		next:function(expr){
			var tmp = xq();
			this.each(function(el){
				var d = _next(el);
				if(!expr || d && xq.matches(d,expr))tmp.push(d);
			});
			return tmp;
		},
		nextAll:function(expr){
			var tmp = xq();
			this.each(function(el){
				while(el && (el = el.nextSibling)){
					if(!expr || xq.matches(el,expr)){
						tmp.push(el);
					}
				}
			});
			return tmp;
		},
		parent:function(expr){
			var tmp = xq();
			this.each(function(el){
				if(!expr && el || el && el.parentNode && xq.matches(el,expr)){
					tmp.push(el);
				}
			});
			return tmp;
		},
		prev:function(expr){
			var tmp = xq();
			this.each(function(el){
				var d = _pre(el);
				if(!expr || d && xq.matches(d,expr))tmp.push(d);
			});
			return tmp;
		},
		prevAll:function(expr){
			var tmp = xq();
			this.each(function(el){
				while(el && (el = el.previousSibling)){
					if(!expr || xq.matches(el,expr)){
						tmp.push(el);
					}
				}
			});
			return tmp;
		},
		siblings:function(expr){
			var tmp = xq();
			this.each(function(el){
				var nodes = el.parentNode.childNodes;
				xq.each(nodes,function(d){
					if(el !== d && d.nodeType === 1 && (!expr || xq.matches(d,expr))){
						tmp.push(el);
					}
				});
			});
			return tmp;
		},
		add:function(){
			this.push.apply(this,arguments);
		}
	});
}(window,document,xq);
;!function(window,document,undefined){

	var name = 'xqFramework',
		version = '0.1.0';

	var protoString = Object.prototype.toString,
		ap = Array.prototype,
		push = ap.push,
		slice = ap.slice,
		splice = ap.splice,
		Type = function(o){
			return protoString.call(o);
		},
		MARK = {};

	"Object Function Array String Number Boolean Date RegExp Null Undefined".replace(/\S+/g,function(val){
		xq['is'+val] = function(o){
			return Type(o).toLowerCase() === ('[object '+val+']').toLowerCase();
		};
	});
	
	xq.isArguments = function(o){
		var t = Type(o).toLowerCase();
		return t === '[object arguments]' || t === '[object object]' && o.callee && 'length' in o;
	}
	xq.isWindow = function(o){
		return o && typeof o === 'object' && o === o.window && 'history' in o && 'location' in o && 'document' in o;
	};
	xq.isDocument = function(o){
		return typeof o === 'object' && o.nodeType === 9 && 'getElementById' in o;
	};
	xq.isElement = function(o){
		return typeof o === 'object' && o.nodeType === 1 && 'getElementsByTagName' in o;
	};
	xq.isNodeList = function(o){
		return o && 'length' in o && typeof o.item === 'function';
	};
	xq.isEmpty = function(o){
		if(!o) return true;
		for(var i in o){ if(o.hasOwnProperty(i)) return false;}
		return true;
	};
	xq.isXqObject = function(o){
		return o instanceof xq;
	};

	function each(source,handler,args){
		var i,l;
		if(!source) return this;
		if(!xq.isFunction(handler)) return this;
		args = args || [];
		if(xq.isArray(source) || xq.isArguments(source) || xq.isNodeList(source)){
			for(i=0,l=source.length;i<l;i++){
				if(handler.apply(source[i],args.concat(source[i],i,source))) return;
			}
		}else if(xq.isObject(source)){
			for(i in source){
				if(!source.hasOwnProperty(i)) continue;
				if(handler.apply(source[i],args.concat(source[i],i,source))) return;
			}
		}
		return this;
	}

	var tagreg = /^<([^<>]+)>$/i,
		htmlreg = /^<([^<>]+)>.*?<\/\1>$/i,
		trimreg = /^\s+|\s+$/mg,
		//对象是否存在__proto__属性
		existProto = '__proto__' in {};
	/**
	 * xq构造器，第一个参数可传入字符串，函数，传入字符串会判断是html，还是css选择器，查找或生成对应节点。
	 *
	 * @class xq
	 * @constructor
	 * @param {String|DOM|Function} selection 传入的css选择器或是html字符串或是function，function会自动加入DOMContentLoaded 
	 * @param {node} content 要查找根节点
	 */
	function xq(selection,content){
		return new xq.fn.init(selection,content);
	}

	var identity = 0;
	/**
	 * xq的原生对象，可对此对象添加方法来扩展xq
	 * @property fn
	 * @type object
	 * @static
	 */
	xq.fn = xq.prototype = {
		constructor:xq,
		length:0,
		init:function(selection,content){
			content = content || document;
			this.content = content;
			this.selector = selection;
			this.__ident__ = {};
			if(xq.isString(selection)){
				selection = xq.trim(selection);
				if(tagreg.exec(selection)){
					selection = document.createElement(RegExp.$1);
					this.push(selection);
				}else if(htmlreg.test(selection)){
					var tmp = document.createElement('div');
					tmp.innerHTML = selection;
					this.push.apply(this,tmp.childNodes);
				}else{
					var result = oQuery(selection,content);
					this.push.apply(this,result);
				}
			}else if(xq.isElement(selection) || xq.isDocument(selection) || xq.isWindow(selection)){
				this.push(selection);
			}else if(xq.isFunction(selection)){
				xq.ready(selection);
			}else if(selection instanceof xq){
				return selection.slice();
			}
		},
		/**
		 * 遍历所有元素
		 *
		 * @method each
		 * @param handler {Function} 处理函数
		 * @param [args] {Array} 传入处理函数的参数
		 * @return void
		 */
		each:function(handler,args){
			if(!handler) return this;
			args = args || [];
			for(var i=0;i<this.length;i++){
				if(handler.apply(this[i],args.concat(this[i],i,this))) return;
			}
		},
		/**
		 * 遍历所有的元素，并返回所有处理函数返回的结果
		 * @method map
		 * @param handler {Function} 处理函数
		 * @return {xq} 返回xq对象
		 */
		map:function(handler){
			var result = xq();
			this.each(function(val,i,s){
				result.push.apply(result,[].concat(handler.call(this,val,i,s)));
			});
			return result;
		},
		/**
		 * 取当前xq对象中某段元素
		 * @method slice
		 * @param pos {Number} 要取数组中的开始的位置
		 * @papam [length] {Number} 要取的长度
		 * @return {xq} 返回结果
		 */
		slice:function(){
			var tmp = xq();
			tmp.push.apply(tmp,slice.apply(this,arguments));
			return tmp;
		},
		/**
		 * 取i指定的索引的元素，返回为xq对象
		 * @methoc eq
		 * @param i {Number} 要取的索引值
		 * @return {xq} 返回i索引值所在的元素
		 */
		eq:function(i){
			if(i<0 && this.length+i < 0 || i>0 && i>=this.length) return null;
			return xq(i < 0 ? this[this.length-1] : this[i]);
		},
		/**
		 * 取xq对象中第一个元素
		 * @method first
		 * @return {xq}
		 */
		first:function(){
			return this.eq(0);
		},
		/**
		 * 取xq对象中最后一个元素
		 * @method last
		 * @return {xq}
		 */
		last:function(){
			return this.eq(-1);
		},
		/**
		 * 取index位的原生元素
		 * @method get
		 * @return {Element}
		 */
		get:function(index){
			if(isNaN(index)) return null;
			index = index < 0 ? this.length - index : index;
			return this[index];
		},
		/**
		 * 获得当前元素的在父元素中的位置
		 * @method index
		 * @param el {Element}
		 * @return {Number} 元素的索引值
		 */
		index:function(el){
			el = el instanceof xq && el[0] || this[0];
			var i = 0;
			if(!el) return i;
			while(el = el.previousSibling){
				if(el.nodeType === 1) i++;
			}
			return i;
		},
		/**
		 * 返回el元素在当前xq对象的位置，from作为查找的开始位置
		 * @method indexOf 
		 * @param el {Element} 传入的el
		 * @param from {Number} 传入的开始位置
		 * @return {Number} 返回索引值，如果未找到，则返回-1
		 */
		indexOf:ap.indexOf || function(el,from){
			var from = from || 0;
			for(var i=from,len=this.length;i<len;i++){
				if(this[i] === el) return i;
			}
			return -1;
		},
		/**
		 * 返回当前xq对象最后一个元素
		 * @method end
		 * @return {xq}
		 */
		end:function(){
			return this.last();
		},
		/**
		 * 压入元素
		 * @method push
		 * @param el* {Element} 要压入的元素
		 */
		push:function(){
			var self = this,
				args = ap.slice.call(arguments);
			xq.each(args,function(el){
				if(xq.isElement(el)){
					if(!self.__existIdent(el)){
						ap.push.call(self,el);
						self.__addIdent(el);
					}
				}else if(xq.isXqObject(el)){
					el.each(function(el){
						if(!self.__existIdent(el)){
							ap.push.call(self,el);
							self.__addIdent(el);
						}
					});
				}
			});
		},
		/**
		 * 排序方法
		 * @method sort
		 * @param handler {Function} 自定义排序函数
		 * @return {xq} 返回本身的xq对象
		 */
		sort:ap.sort,
		/**
		 * 剪切当前xq对象中某段元素并返回
		 * @method splice
		 * @param index {Number} 要裁剪的开始位置
		 * @param [length] {Number} 要裁剪的长度
		 * @return {xq} 返回结果的xq对象
 		 */
		splice:function(){
			var tmp = xq(),self = this,
				dels = splice.apply(this,arguments);
			xq.each(dels,function(el){
				self.__delIdent(el);
			});
			tmp.push.apply(tmp,dels);
			return tmp;
		},
		__existIdent:function(el){
			var id = xq.getIdentity(el);
			return this.__ident__[id] === MARK;
		},
		__delIdent:function(el){
			if(xq.isElement(el)){
				var id = xq.getIdentity(el);
				delete this.__ident__[id];
			}else if(xq.isXqObject(el)){
				el.each(function(el){
					xq.__delIdent(el);
				});
			}
		},
		__addIdent:function(el){
			var id = xq.getIdentity(el);
			this.__ident__[id] = MARK;
		}
	};

	xq.fn.extend = xq.extend = function(ret,obj){
		var args = arguments;
		if(args.length === 0) return this;
		if(args.length === 1){
			obj = ret;
			ret = this;
		}
		each(obj,function(val,i){
			ret[i] = val;
		});
		return ret;
	};
	xq.fn.init.prototype = xq.fn;
	var _xq = window.xq,_$ = window.$;
	xq.extend({
		/**
		 * 版本
		 * @property
		 */
		version:version,

		identification: name + +new Date() +Math.random().toString().replace('.',''),
		identity:function(){
			return identity++;
		},
		/**
		 * 归还占有的全局xq变量，返回xq对象
		 * @method noConfict
		 * @return {xq} 
		 * @static
		 */
		noConfict:function(){
			window.xq = _xq;
			window.$ = _$;
			return xq;
		},
		/**
		 * 改变函数执行上下文
		 * @method proxy
		 * @param fun {Function} 要改变上下文的函数
		 * @param object {Object} 上下文对象
		 * @param [args] {Array} 要入函数的额外参数
		 * @return {Function} 返回函数
		 * @static
		 */
		proxy:function(fun,object,args){
			args = args || [];
			if(xq.isFunction(fun.bind)){
				return fun.bind.apply(fun,args);
			}else{
				return function(){
					fun.apply(object,args.concat(arguments));
				};
			}
		},
		/**
		 * 去除字符串头尾的空格字符串
		 * @method trim 
		 * @param str {String} 字符串
		 * @return {String} 被裁剪头尾空格的字符串
		 * @static
		 */
		trim:function(str){
			str += '';
			return str.trim ? str.trim() : str.replace(trimreg,'');
		},
		/**
		 * 对集合遍历处理
		 * @method each
		 * @param items {Object|Array} 要遍历的对象
		 * @param handler {Function} 处理函数
		 * @return void 
		 * @static
		 */
		each:each,
		/**
		 * 筛选集合对象
		 * @method grep
		 * @param items {Array|Object} 要筛选的对象
		 * @param handler {Function} 筛选函数
		 * @return {Array|Object} 返回筛选结果
		 * @static
		 */
		grep:function(items,handler){
			var result = xq.isArray(items) ? [] : {}; 
			each(items,function(v,i,l){
				if(handler(v,i,l)){
					result.push(v)
				}
			});
			return result;
		},
		/**
		 * 获得value在list中的索引值
		 * @method indexOf
		 * @param list {Array} 被查找的数组
		 * @param value {Any} 查找的元素
		 * @return {Number} 返回索引值
		 */
		indexOf:function(list,value){
			var index = -1;
			each(list,function(v,i){
				if(value === v){
					index = i;
					return true;
				}
			});
			return index;
		},
		/**
		 * 遍历集合，并返回合并后处理函数返回结果
		 * @method map
		 * @param list {Array} 要遍历的数组对象
		 * @param handler {Function} 处理函数
		 * @param [args] {Array} 传入参数
		 * @return {Array} 返回数组对象
		 * @static
		 */
		map:function(list,handler,args){
			var result = [];
			args = args || [];
			each(list,function(v,i,l){
				push.apply(result,[].concat(handler.apply(null,args.concat(arguments))));
			});
			return result;
		},
		/**
		 * 返回对象的类型
		 * @method type
		 * @param o {Any} 任何类型
		 * @return {String} 返回类型的字符串表示
		 * @static
		 */
		type:function(o){
			if(o === null) return 'null';
			if(o === undefined) return 'undefined';
			if(o && xq.isArguments(o)) return 'arguments';
			if(o !== o) return 'NaN';
			switch(Type(o).toLowerCase()){
				case '[object object]':
					return 'object';
				case '[object string]':
					return 'string';
				case '[object array]':
					return 'array';
				case '[object function]':
					return 'function';
				case '[object number]':
					return 'number';
				case '[object boolean]':
					return 'boolean';
				case '[object date]':
					return 'date';
				case '[object error]':
					return 'error';
				case '[object regexp]':
					return 'regexp';
				case '[object math]':
					return 'math';
			}
		},
		/**
		 * 对象转换为json字符串
		 * @method stringify 
		 * @param {Object} 对象
		 * @return {String} 返回json字符串
		 * @static
		 */
		stringify:typeof JSON !== 'undefined' && JSON.stringify && null || stringify,
		/**
		 * json字符串转换为Object
		 * @method parseJSON
		 * @param json {String} json字符串
		 * @return {Object} 返回Object
		 * @static 
		 */
		parseJSON:typeof JSON !== 'undefined' && JSON.parse || parse,
		/**
		 * 将集合转换为数组
		 * @method toArray
		 * @param list {NodeList|Arguments|Object} 集合类型的对象
		 * @return {Array} 返回集合
		 */
		toArray:function(list){
			if(list.toArray) return list.toArray();
			try{
				return slice.call(list);
			}catch(e){
				for(var ret=[],i=0,l=list.length;i<l;i++)ret[i] = list[i];
				return ret;
			}
		},
		/**
		 * 判断一个元素是否另一个元素内
		 * @method container
		 * @param el {Node} 子元素
		 * @param parent {Node} 父元素
		 * @return {Boolean}  
		 */
		container:function(el,parent,endnode){
			var rel = el.parentNode;
			do{
				if(rel === parent) return true;
				if(endnode && rel === endnode) return false;
			}while(rel = rel.parentNode);
			return false;
		},
		/**
		 * 判断一个元素是否符合一个CSS选择器
		 * @method matches
		 * @param node {Node} 元素
		 * @param selector {Node} 要匹配的选择器
		 * @return {Boolean}  
		 */
		matches:function(node,selector){
			return oQuery.matchesSelector.apply(oQuery,arguments);
		},
		noop:function(){}
	});
	window.xq = xq;
	window.$ = xq;
	function stringify(o){
		var t = xq.type(o),i,l,len;
		if(t === 'string') return '"'+o+'"';
		if(t === 'date') return 'new Date(' + o.getTime() + ')';
		if(t === 'regexp' || t === 'boolean' || t === 'number' || t === 'function') return o.toString();
		if(t === 'array'){
			l = [];
			for(i=0,len=o.length;i<len;i++){
				l.push(stringify(o[i]))
			}
			return '[' + l.join(',') + ']';
		}
		if(t === 'object'){
			l = [];
			for(i in o){
				if(o.hasOwnProperty(i))l.push('"' + i + '"' + ':' + stringify(o[i]))
			}
			return '{' + l.join(',') + '}';
		}
		if(t === 'unll' || t === 'undefined') return 'null';
		return null;
	}
	function parse(str){
		try{
			return (new Function('return ' + str))();
		}catch(e){
			return null;
		}
	}
}(window,document);




/**
 * xQ framework data module
 */

;!function(window,document,xq){
	var cache = {};

	function getIdentity(el){
		return el[xq.identification] ? el[xq.identification] : (el[xq.identification] = xq.identity());
	}
	function getData(el,name){
		var id = getIdentity(el);
		cache[id] = cache[id] || {};
		return cache[id][name] || null;
	}

	function addData(el,name,value){
		var id = getIdentity(el);
		cache[id] = cache[id] || {};
		cache[id][name] = value;
	}
	function removeData(el,name){
		var id = getIdentity(el);
		cache[id] = cache[id] || {};
		if(name){
			delete cache[id][name];
		}else{
			delete cache[id];
		}
	}
	xq.extend({
		data:function(el,name,value){
			if(value){
				addData(el,name,value);
			}else{
				return getData(el,name);
			}
		},
		removeData:removeData,
		getIdentity:getIdentity
	});
	xq.fn.extend({
		/**
		 * 给元素对象设置数据，value不传则为取数据
		 * @method data
		 * @param name {any} 设置或读取的数据名
		 * @param value {any} 保存的数据
		 * @return {xq|any} 设置数据返回的是xq对象，读取数据则返回数据本身
		 */
		data:function(name,value){
			if(value){
				this.each(function(el){
					addData(el,name,value);
				})
				return this;
			}else{
				if(!this.length) return null;
				if(this.length === 1) return getData(el,name);
				var res = [];
				this.each(function(el){
					res.push(getData(el,name));
				});
				return res;
			}
		},
		/**
		 * 删除当前元素对象的数据
		 * @method data
		 * @param name {any} 删除数据的名称
		 * @return {xq} 返回的是xq对象
		 */
		removeData:function(name){
			this.each(function(el){
				removeData(el,name);
			});
			return this;
		}
	});
}(window,document,xq);
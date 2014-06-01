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


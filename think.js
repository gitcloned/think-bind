/*
* think.js v1.0 (http://code.google.com/p/thinkweb)
* 
* Code license
* (Apache License 2.0)
*/


var $t = {};

// extensions
(function () {
    String.prototype.format = function () {
        var args = [];
        if (arguments.length == 1) args = arguments[0];
        else if (arguments.length > 1) {
            for (var i = 0; i < arguments.length; i++)
                args.push(arguments[i]);
        }
        if (!(args instanceof Array)) args = [ args ];
        var bits = this.split( /%s/g );
        var ret = [];
        for (var i=0; i<bits.length - 1; i++) {
            ret.push(bits[i]);
            if (i < args.length) ret.push(args[i]);
        }
        ret.push(bits[i]);
        return ret.join('');
    };
    Array.prototype.forEachX = function(func, ctx) {
        var ret = [];
        for (var i=0; i<this.length; i++)
            ret.push(func.call(ctx, this[i], i));
        return ret;
    };
    Array.prototype.withEach = function(func, arg) {
        for (var i = 0; i < this.length; i++)
            arg = func(this[i], arg);
        return arg;
    };
})();

// utility functions
(function () {
    this.createXmlHttp = function() {
        if (window.XMLHttpRequest) return new XMLHttpRequest();
        else return new ActiveXObject("Microsoft.XMLHTTP");
    };
    this.ajax = function (args) {
        args = $.extend({
            'callback': function () { },
            'type': 'GET',
            'url': '',
            'isAsync': true,
            'data': null
        }, args);
        var req = this.createXmlHttp();
        req.onreadystatechange = function() {
            if (req.readyState == 4)
                args['callback'].call(req);
        };
        req.open(args['type'], args['url'], args['isAsync']);
        req.send(args['data']);
    };
    this.jsonp = function (args) {
        args = $.extend({
            'callback': 'cb',
            'url': ''
        }, args);
        var script = document.createElement("script");
        script.setAttribute("type", "text/javascript");
        script.setAttribute("language", "javascript");
        script.src = args['url'].toString().format(args['callback']);
        document.getElementsByTagName('head')[0].appendChild(script);
    };
    this.as_args_kwargs_with = function(tokens) {
        var as_var = undefined;
        var with_var = undefined;
        var args = [];
        var kwargs = { };
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            if (token == "as") {
                as_var = tokens[++i];
                continue;
            }
            if (token == "with") {
                with_var = tokens[++i];
                continue;
            }
            if (token.indexOf('=') != -1) {
                var s = token.split('=', 1);
                kwargs[s[0]] = s[1];
            }
            else
                args.push(token);
        }
        return [args, kwargs, as_var, with_var];
    };
    this.as_kwargs = function(tokens) {
        var kwargs = { };
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            if (token == "as") {
                kwargs['as'] = tokens[++i];
                continue;
            }
            if (token == "with") {
                kwargs['with'] = tokens[++i];
                continue;
            }
            if (token.indexOf('=') != -1) {
                var s = token.split('=', 1);
                kwargs[s[0]] = s[1];
            }
            else
                kwargs[i + ""] = token;
        }
        return kwargs;
    };
}).call($t);

// parser
(function () {
    this.Parser = function (content) {
        this.stream = content.replace(/(\r\n|\n|\r)/gm, "");
        this.tokensplitter = /\s+/gm;
        this.tokens = content.split(this.tokensplitter);
        this.curridx = -1;
        this.hasParsed = false;
    };
    this.Parser.prototype.parse = function (pattern) {
        if (this.hasParsed) return undefined;
        var match = this.stream.search(pattern);
        if (match == -1) {
            this.hasParsed = true;
            return [this.stream];
        }
        var parsedvalue = this.stream.substring(0, match);
        var value = this.stream.match(pattern)[0];
        this.stream = this.stream.substring(match + value.length);
        match = null;
        return [parsedvalue, value];
    };
    this.Parser.prototype.parseNext = function () {
        return this.parse( /\s+/gm );
    };
}).call($t);

// templatemyweb skeleton
(function () {
    this.template = {
        
        libraries: {},

        TemplateParser: function (content) {
            this.parser = new $t.Parser(content);
        },

        Template: function (template) {
            var templateParser = new $t.template.TemplateParser(template);
            var tokens = undefined;
            this.nodelist = [];
            while((tokens = templateParser.parseNext())) {
                this.nodelist.push($t.template.libraries["__static__"](templateParser, {"template": tokens[0]}));
                if (tokens.length > 1) {
                    var bits = tokens[1].split( /\s+/g , 3);
                    this.nodelist.push($t.template.libraries["__" + bits[1] + "__"](templateParser, $t.as_kwargs(bits[2].split(/\s+/g))));
                }
            }
        }
    };

    this.template.TemplateParser.prototype.parseNext = function() {
        return this.parser.parse(/{%(.|\n)*?%}/gm);
    };
    
    this.template.TemplateParser.prototype.parse = function(tag, matchFromEnd) {
        return this.parser.parse(new RegExp(matchFromEnd ? "{%(\\s)*" + tag + "(\\s)*?%}(?!.*{%(\\s)*" + tag + "(\\s)*?%})" : "{%(\\s)*" + tag + "(\\s)*?%}", "m"));
    };
    
    this.template.Template.prototype.render = function(context) {
        var out = "";
        for(var i =0; i<this.nodelist.length; i++)
            out += this.nodelist[i].render(context);
        return out;
    };
}).call($t);

// register static
(function () {

    this.__static__ = function(parser, kwargs) {
        return new this.static(kwargs);
    };
    this.static = function (params) {
        params = $.extend({ 'template': '' }, params);
        this.nodelist = params['template'];
    };
    this.static.prototype.render = function (context) {
        var match = this.nodelist.match(/{{(.)*?}}/gm);
        if (!match) return this.nodelist;

        return match.withEach(function (it, str) {
                                                    var key = it.substring(2, it.length - 2);
                                                    var tokenMatch = key.match(/__(.)*?__/gm);
                                                    if (!tokenMatch) {
                                                        var val = undefined;
                                                        try { val = eval("context." + key); } catch (e) { }
                                                        if (typeof val != "undefined")
                                                            return str.replace(it, val);
                                                        return str;
                                                    }
                                                    else {
                                                        key = tokenMatch.withEach(function (tkit, tkstr) {
                                                            var tkey = tkit.substring(2, tkit.length - 2);
                                                            var val = undefined;
                                                            try { val = eval("context." + tkey); } catch (e) { }
                                                            if (typeof val != "undefined")
                                                                tkstr = tkstr.replace(tkit, val);
                                                            return eval(tkstr);
                                                        }, key);
                                                        return str.replace(it, key);
                                                    }
                                                }, this.nodelist);
    };
}).call ($t.template.libraries);

// register repeat
(function () {

    this.__repeat__ = function(parser, kwargs) {
        kwargs["template"] = parser.parse("endrepeat")[0];
        return new this.repeat(kwargs);
    };

    this.repeat = function (params) {
        params = $.extend({ 'template': '' }, params);
        this.data = params['0'];
        this.nodelist = new $t.template.Template(params['template']);
    };
    this.repeat.prototype.render = function (context) {
        var iter = context instanceof Array ? context : context[this.data];
        return iter.forEachX(function (it, idx) {
            it["idx"] = idx;
            return this.nodelist.render(it);
        }, this).join('');
    };
}).call ($t.template.libraries);

// register box
(function () {

    this.__box__ = function(parser, kwargs) {
        kwargs["template"] = parser.parse("endbox", true)[0];
        return new this.box(kwargs);
    };

    this.box = function (params) {
        params = $.extend({
            'url': '',
            'autoupdate': false,
            'onupdate': 'append',
            'mode': 'query',
            'template': ''
        }, params);
        this.name = params.name;
        this.url = params['url'];
        this.autoupdate = params['autoupdate'] ? true : false;
        this.onupdate = params['onupdate'];
        this.nodelist = new $t.template.Template(params['template']);
        this.mode = params['mode'];

        if (this.autoupdate) {
            clearInterval($t.template.libraries.box.updatetimers[this.name]);
            $t.template.libraries.box.updatetimers[this.name] = setInterval("$t.template.libraries.box.updatebox('" + this.name + "')", 10000);
        }
    };
    this.box.prototype.update = function () {
        $t.jsonp({
                'url': this.url,
                'callback': '$t.template.libraries.box.onboxupdated'
            });
    };
    this.box.prototype.handleupdate = function (context) {
        var res = this.render(context);

        if (this.onupdate == "append")
            document.getElementById("__%s.box__".format(this.name)).innerHTML += this.render(context);
        else
            document.getElementById("__%s.box__".format(this.name)).innerHTML = this.render(context);
    };
    this.box.prototype.render = function (context) {
        if (this.mode == 'query')
            return this.nodelist.render(context);
        else
            return context;
    };
}).call ($t.template.libraries);

// box utils
(function () {
    this.list = {};
    this.updatetimers = {};

    this.updatebox = function (name) {
        this.list[name].update();
    };
    this.onboxupdated = function (obj) {
        var name = obj.name;
        var res = obj.result;
        this.list[name].handleupdate(res);
    };
    this.add = function (params) {
        this.list[params.name] = new this(params);
    };
}).call ($t.template.libraries.box);

// test
var parser = new $t.Parser("{% runquery name=post as stocks %}");
//alert(parser.parseNext());
//alert(parser.parseNext());
//alert(parser.parse("stocks"));

//document.write(new $t.template.Template("<ul> {% repeat result %} <li>Count: {{cnt}} </li> {% endrepeat %}</ul>").render({ "result": [{'cnt': 1}, {'cnt': 2}, {'cnt': 3}] }));
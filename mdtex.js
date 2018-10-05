if (require && typeof window === 'undefined') {
    var __ = require('./lib/__.js');
    var marked = require('marked');
    module.exports = mdtex;
}

function mdtex (text) {
// mdtex {-----> 


/* 
Lexer :: 
    Str  
    ->  
    { 
        match   : [ Str, Str, Str ] || Null,
        lexer   : Lexer,
        index   : Int
    }

lexer :: 
    { 
        read    : [ Str, Str ],
        write   : [ Str, Str ],
        state   : Bool,
        _name    : Str
    } 
    -> 
    Lexer

*/

let lexemes = [

    lexer()
        ._name('imath')
        .read([ /(\\){1,2}\(/, /(\\){1,2}\)/ ])
        .write([
            '<script type="math/tex">',
            '</script>'
        ]),

    lexer()
        ._name('math')
        .read([ /(\\){1,2}\[/, /(\\){1,2}\]/ ])
        .write([
            '<script type="math/tex; mode=display">',
            '</script>'
        ]),

    lexer() 
        ._name('code')
        .read([ /`/, /`/ ])
        .write(['`', '`']),

    lexer()
        ._name('codeblock')
        .read([ /```/, /```/])
        .write(['```', '```'])
];

function parser (text) {
    
    let eqs = [],
        eqToken = i => '$TeX%' + i + '$';

    let __ = __lib();

    let insertEq = (eq, i) => 
        txt => txt.replace(eqToken(i), eq);

    let insertEqs = text => 
        __.pipe(...eqs.map(insertEq))(text);

    return __.pipe(
        read,
        marked,
        insertEqs
    )(text);

    function read (str, lex=lexemes) {
        
        let [m, ...ms] = lex
            .map(__.$(str))
            .filter(x => x.match)
            .sort((x,y) => x.index >= y.index);

        if (!m) return (str);

        let l = m.lex(0);
        let before, after;
        
        if (l._name() === 'imath') {
            if (!l.state()) {
                before = m.match[0];
                after = m.match[1] + m.match[2];
            } else {
                before = eqToken(eqs.length);
                after = m.match[2];
                eqs.push(m.match[0] + m.match[1]);
            }
        } 
        else {
            before = m.match[0] + m.match[1];
            after = m.match[2];
        }

        lex = !l.state() 
            ? [m.lex(1)]
            : lexemes;
        
        return before + read(after, lex);
    }
}

function lexer (C) {

    let self = {
            _name : '<lexer>',
            read :  null,
            write : null,
            state : 0,
        };

    Object.assign(self, C || {});

    let lex = __.pipe(
        m => Object.assign({},
            self, 
            {state : (self.state + !!m) % 2}
        ),
        lexer
    );

    function my (str) {

        let i = self.state;
        let m = str.match(self.read[i]);

        return {
            match : m && [
                str.slice(0, m.index), 
                self.write[i],
                str.slice(m.index + m[0].length)
            ],
            index : m && m.index,
            lex : lex,
        };
    }

    return __.getset(my, self);
}

function __lib () {
    let __ = {};

    __.id =
        x => x;

    __.$ = 
        (...xs) => 
            f => f(...xs);

    __.pipe = 
        (f=__.id, ...fs) => fs.length
            ? (...xs) =>  __.pipe(...fs)(f(...xs))
            : (...xs) => f(...xs);

    __.forKeys = 
        (...fs) => 
            obj => Object.keys(obj).forEach(
                k => __.pipe(...fs)(k, obj[k])
            );

    __.getset = getset;

    function getset (obj, attrs) {
        let method = 
            key => function (x) {
                if (!arguments.length)
                    return attrs[key];
                attrs[key] = x;
                return obj;
            };
        __.forKeys(
            key => obj[key] = method(key)
        )(attrs);
        return obj;
    }
    return __;
}


// <-----} mdtex 
return parser(text);
} 

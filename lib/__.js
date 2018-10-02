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

module.exports = __;

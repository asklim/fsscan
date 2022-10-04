
const asyncConsistently = (
    asyncFns,
    initValue
) => asyncFns.reduce(
    (promise, fn) => promise.then( (v) => fn( v )),
    Promise.resolve( initValue )
);

export default asyncConsistently;

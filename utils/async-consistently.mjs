/**
 * Последовательно выполняет асинхронные функции из asyncFns
 * передавая на вход значение предыдущей или initValue для
 * функции asyncFns[0]
 * @param {[]} asyncFns
 * @param {Promise} initValue
 */
const asyncConsistently = async (
    asyncFns,
    initValue
) => {
    const lastPromise = asyncFns.reduce(
        (promise, fn) => promise.then( (v) => fn( v )),
        Promise.resolve( initValue )
    );
    return await lastPromise;
};

export default asyncConsistently;

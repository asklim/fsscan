
export class AbstractActor {

    #total = 0;

    constructor () {}

    keyName = () => 'abstract Actor';

    middleware = async (fullname) => {
        if ( fullname == undefined ) {
            return;
        }
        /** Processing with fullname */
        return fullname;
    };

    total () { return this.#total; }

    incrementTotal (value=1) { this.#total += value; }

    results () {
        return Object.create( null );
    }
}


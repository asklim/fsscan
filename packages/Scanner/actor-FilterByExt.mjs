
import * as path from 'node:path';
import { AbstractActor } from './actor-Abstract.mjs';

export class FilterByExt extends AbstractActor {

    #exts;
    #filterByExt = [];

    constructor (filesExts) {
        super();
        if ( !Array.isArray( filesExts )) {
            throw new Error('FilterByExt: argument is not a Array.');
        }
        this.#exts = filesExts;
    }

    keyName = () => 'filterByExt';

    middleware (fullname) {
        if ( fullname == undefined ) {
            return;
        }
        let result;
        let { ext } = path.parse( fullname );
        if ( this.#exts.includes( ext )) {
            result = fullname;
            this.#filterByExt.push( fullname );
            this.incrementTotal();
        }
        return result;
    }

    results () {
        return [ ...this.#filterByExt ];
    }
}


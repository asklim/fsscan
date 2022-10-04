
import * as path from 'node:path';
import { AbstractActor } from './actor-Abstract.mjs';

export class FilterByExt extends AbstractActor {

    #exts = [];
    #filterByExt = [];

    constructor (filesExts) {
        super();
        if ( !Array.isArray( filesExts )) {
            throw new Error('FilterByExt: argument is not a Array.');
        }
        this.#exts = this.#createExtListWithDots( filesExts );
    }

    keyName = () => 'filterByExt';

    middleware = async (fullname) => {
        fullname = await fullname;
        if ( fullname == undefined ) {
            return;
        }

        let { ext } = path.parse( fullname );
        if ( !this.#exts.includes( ext )) {
            return;
        }

        this.#filterByExt.push( fullname );
        this.incrementTotal();
        return fullname;
    };

    results () {
        return [ ...this.#filterByExt ];
    }

    #createExtListWithDots (exts) {
        let outExts = [];
        for (
            let ext of exts
        ) {
            if ( ext && typeof ext == 'string' ) {
                outExts.push( ext[0] !== '.' ?
                    `.${ext}`
                    : ext
                );
            }
        }
        return outExts;
    }
}


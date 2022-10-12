
import * as path from 'node:path';
import { AbstractActor } from './actor-Abstract.mjs';

export class FilterByExt extends AbstractActor {

    #exts = [];
    #actorResults = [];
    #format;

    constructor ({
        exts: filesExts,
        reportFormat
    }) {
        super();
        if ( !Array.isArray( filesExts )) {
            throw new Error('FilterByExt: argument is not a Array.');
        }
        this.#exts = this.#createExtListWithDots( filesExts );
        this.#format = reportFormat;
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

        this.#actorResults.push( fullname );
        this.incrementTotal();
        return fullname;
    };

    results () {
        return this.#format == 'exts' ?
            countingByExt( this.#actorResults )
            : {
                results: [ ...this.#actorResults ]
            }
        ;
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


function countingByExt( fileslist ) {

    const filesByExt = {};

    for ( let fname of fileslist ) {
        let { ext } = path.parse( fname );
        filesByExt[ ext ] ??= 0;
        filesByExt[ ext ] += 1;
    }

    const sorted = Object.entries( filesByExt ).
        sort( compareEntryByKey );
    return Object.fromEntries( sorted );


    function compareEntryByKey (a, b) {
        if ( a[0] > b[0] ) { return 1; }
        if ( a[0] < b[0] ) { return -1; }
        return 0;
    }
}

import * as path from 'node:path';
import { AbstractActor } from './actor-Abstract.mjs';

export class CountingByExt extends AbstractActor {

    #sortByExt = 0;
    #sortByCount = 0;
    #total = 0;

    constructor ({
        sortBy=undefined,
        direction=undefined,
    }={}) {
        super();
        //TODO: Сделать выбор сортировки
        this.#sortByExt = sortBy;
        this.#sortByCount = direction;
        this.filesByExt = {};
    }

    keyName = () => 'filesByExt';

    middleware (fullname) {
        if ( fullname == undefined ) {
            return;
        }
        let { ext } = path.parse( fullname );
        this.filesByExt[ ext ] ??= 0;
        this.filesByExt[ ext ] += 1;
        this.#total += 1;
        return fullname;
    }

    total = () => this.#total;

    results () {
        const sorted = Object.
            entries( this.filesByExt ).
            sort( compareEntryByKey );
        return Object.fromEntries( sorted );
    }
}

function compareEntryByKey (a, b) {
    if ( a[0] > b[0] ) { return 1; }
    if ( a[0] < b[0] ) { return -1; }
    return 0;
}

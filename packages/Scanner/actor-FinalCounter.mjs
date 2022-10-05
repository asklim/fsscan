
// import * as path from 'node:path';
import { AbstractActor } from './actor-Abstract.mjs';

export class FinalCounter extends AbstractActor {

    constructor () {
        super();
    }

    keyName = () => 'finalCounter';

    middleware = async (fullname) => {
        if ( fullname == undefined ) {
            return;
        }

        this.incrementTotal();
        return fullname;
    };


    results () {
        return ({
            total: this.total()
        });
    }
}

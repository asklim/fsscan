
export class AbstractActor {

    constructor () {}

    keyName = () => 'abstract Actor';

    middleware (fullname) {
        return fullname;
    }

    total = () => 0;

    results () {
        return Object.create( null );
    }
}


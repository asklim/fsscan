import { AsyncQueue } from "../AsyncQueue.mjs";

let handler;

function eventStream (element, type) {
    const q = new AsyncQueue(); // Create a queue
    handler = (e) => q.enqueue(e);
    element.addEventListener( type, handler ); // Enqueue events
    console.log('Listener added.');
    return q;
}

(async function handleKeys (elem) {
    // Get a stream of keypress events and loop once for each one
    const q = eventStream( elem, "keypress");
    console.log('queue', q );
    for await (
        const event of q
    ) {
        console.log( event.key );
        if( event.key.toUpperCase() == 'Q' ) {
            elem.removeEventListener("keypress", handler );
            console.log('Listener has removed.');
        }
    }
})( globalThis.document );

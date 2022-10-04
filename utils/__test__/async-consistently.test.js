
import { describe, expect, jest } from "@jest/globals";
import asyncConsistently from "../async-consistently.mjs";


function pause( ms ) {
    return new Promise( (resolve) => setTimeout( resolve, ms ));
}

function fabric( add, delay ) {
    return (
        async (v) => {
            await pause( delay );
            return v + add;
        }
    );
}

jest.setTimeout( 20_000 );

describe('very long test consistency', () => {
    const fns = [
        fabric( 1, 1_000 ),
        fabric( 2, 2_000 ),
        fabric( 4, 3_000 ),
        fabric( 8, 4_000 )
    ];
    test('all function invoked.', async () => {
        let v = await asyncConsistently( fns, 5 );
        expect( v ).toBe( 5+1+2+4+8 );
    });
});

import inputs from './input-sample.json';
import hashMD5 from '../../md5/';
import MD5 from 'md5.js';
import nodeMD5 from 'md5';


const testValues = [
    '',
    'This is sample English string',
    'Это строка на русском языке.',
    '12345678-1234-1234-1234-123456789012',
    'abcdefgh-abcd-abcd-abcd-abcdefghijkl'
];

describe('compare md5hash with md5.js', () => {
    testValues.
    forEach( (v,i) => {
        test(`1.${i}/forValue: "${v}"`, () => {
            let my = hashMD5( v );
            let md5 = new MD5().update( v ).digest('hex');
            expect( my ).toBe( md5 );
        });
    });
});

describe('compare node-md5 with md5.js', () => {
    testValues.
    forEach( (v,i) => {
        test(`2.${i}/forValue: "${v}"`, () => {
            let test2 = nodeMD5( v );
            let md5js = new MD5().update( v ).digest('hex');
            expect( test2 ).toBe( md5js );
        });
    });
});

describe('compare node-md5 with md5.js from input-sample.json...', () => {
    inputs.
    forEach( (v,i) => {
        test(`3.${i}/forValue: ${v}`, () => {
            let test3 = nodeMD5( v );
            let md5js = new MD5().update( v ).digest('hex');
            expect( test3 ).toBe( md5js );
        });
    });
});

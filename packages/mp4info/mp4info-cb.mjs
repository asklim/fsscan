import * as fs from 'node:fs';

import MP4Box from 'mp4box';

console.log( process.argv );
const FOLDER_NAME = process.argv[2];

const fileList = fs.readdirSync( FOLDER_NAME ).
    filter( (item) => item.toLowerCase().endsWith('.mp4'));
console.log( fileList );

fileList.forEach( (fname) => {
    mp4info( FOLDER_NAME + fname );
});

function mp4info (fullname) {

    const mp4 = MP4Box.createFile();
    mp4.onError = function (error) {
        console.log( error );
    };
    mp4.onReady = function (info) {
        console.log(
            'Received File Information',
            '\nfile name: "' + fullname + '"',
            '\n', JSON.stringify( info, null, 4 )
        );
    };

    const buffer = new Uint8Array( fs.readFileSync( fullname )).buffer;
    buffer.fileStart = 0;

    mp4.appendBuffer( buffer );
    //console.log( mp4.print( MP4Box.Log )); //undefined
}

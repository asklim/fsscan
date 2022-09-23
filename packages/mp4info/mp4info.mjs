import {
    readdirSync,
    readFile,
} from 'node:fs';

import MP4Box from 'mp4box';
import MediaInfo from 'mediainfo.js';


console.log( process.argv );
const FOLDER_NAME = process.argv[2];

const fileList = readdirSync( FOLDER_NAME ).filter(
    (item) => item.toLowerCase().endsWith('.mp4')
    //    || item.toLowerCase().endsWith('.mkv')
);
console.log( fileList );

const tasks = [];

fileList.forEach( (fname) => {
    tasks.push( mp4info( FOLDER_NAME + fname ));
});

console.log( tasks );
Promise.allSettled( tasks ).then(
    (info) => console.log( JSON.stringify( info, null, 4 ))
);

function mp4info (fullname) {
    return new Promise( (resolve, reject) => {

        const mp4 = MP4Box.createFile()
        mp4.onError = function (errorString) {
            console.log( errorString );
            reject( errorString );
        };
        mp4.onReady = function (info) {
            console.log( fullname );
            resolve({
                fullname,
                ...info,
            });
        }

        readFile( fullname, (err, data) => {
            if (err) reject( err );
            //console.log( typeof data ); //<Buffer>
            const { buffer } = new Uint8Array( data );
            buffer.fileStart = 0;

            mp4.appendBuffer( buffer );
            //console.log( mp4.print( MP4Box.Log )); //undefined
        });
    });
};

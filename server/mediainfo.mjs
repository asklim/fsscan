import createDebug from 'debug';
const dbgM = createDebug('main');
const dbgT = createDebug('test');

const UR_EVENT_NAME = 'unhandledRejection';
import process from 'node:process';
process.on( UR_EVENT_NAME, (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, throwing an error, or other logic here
});

import {
    existsSync,
    readdirSync,
    mkdirSync,
} from 'node:fs';

import MediaInfo from 'mediainfo.js';
//console.log('MediaInfo is', typeof MediaInfo ); // function

import fetchMediaInfo from '../packages/MediaAreaNet/fetchMediaInfo.mjs';
import {
    OUTPUT_DIR_NAME,
    saveResults,
    summarize,
} from '../utils/output.mjs';

if( !existsSync( OUTPUT_DIR_NAME )){
    mkdirSync( OUTPUT_DIR_NAME );
    console.log('Создана папка для хранения результатов:', OUTPUT_DIR_NAME );
}

let mediainfo = await MediaInfo();
dbgM('medianfo is', typeof mediainfo );   // object
console.log( mediainfo );
mediainfo?.close();


(async function () {
    let medianetLib;
    try {
        dbgM( process.argv );
        const FOLDER_NAME = process.argv[2];

        dbgT(`UR.listeners at start: ${process.listenerCount( UR_EVENT_NAME )}`);

        const PIE_COUNT = 5;
        const fileList = fileListSync( FOLDER_NAME );

        medianetLib = await MediaInfo({ full: true });

        let info = [];

        const getTasksByPieces = generatorListInParts({
            list: fileList,
            count: PIE_COUNT,
            fn: (fname) => fetchMediaInfo( fname, medianetLib )
        });
        for await (
            let piece of getTasksByPieces()
        ) {
            let pieceInfo = await Promise.allSettled( piece );
            dbgT(`pieInfo.length: ${pieceInfo.length}`);
            info = [...info, ...pieceInfo];
        }

        const summary = await summarize( info );
        await saveResults( info, summary );

        await pause( 1600 );
        console.log( summary );
    }
    catch (err) {
        console.log( err.stack );
        process.exit( 1 );
    }
    finally {
        medianetLib?.close();
        dbgT(`UR.listeners: ${process.listenerCount( UR_EVENT_NAME )}`);
        dbgT( process.rawListeners( UR_EVENT_NAME ));
        console.log( global.performance );
        console.log('end script.');
    }
})();


function fileListSync (dirName) {

    if( dirName.at(-1) !== '/' ) { dirName += '/'; }

    const fileList = readdirSync( dirName ).
        filter(
            (item) => item.toLowerCase().endsWith('.mkv')
                || item.toLowerCase().endsWith('.mp4')
                || item.toLowerCase().endsWith('.ts')
                || item.toLowerCase().endsWith('.avi')
                || item.toLowerCase().endsWith('.mpeg')
                || item.toLowerCase().endsWith('.flv')
        ).
        map( (x) => `${dirName}${x}`)
    ;
    dbgM( fileList );
    return fileList;
}

/**
 * [ru] Выдаёт список list кусками по count,
 * применяя к элементам функцию fn
 * @param {*} param0
 * @returns
 * - generator function, which returns
 * - [ fn( list[0] ), ... fn( list[count-1] )]
 * - [ fn( list[count] ), ... fn( list[2*count-1] )]
 */
function generatorListInParts ({
    list,
    count,
    fn
}) {
    return (
        async function * () {

            const total = list.length;
            let iter = 0;
            let begIdx = 0;
            let endIdx = 0 + count;

            do {
                let pie = list.slice( begIdx, endIdx );
                let tasks = pie.map( fn );
                dbgT(`iteration ${iter}, tasks: ${tasks.length}`);

                // eslint-disable-next-line no-await-in-loop
                await pause( 1500 );
                yield tasks;

                iter += 1;
                begIdx = iter * count;
                endIdx = begIdx + count;
            } while ( total > begIdx );
        }
    );
}


function pause( ms ) {
    return new Promise( (resolve) => setTimeout( resolve, ms ));
}

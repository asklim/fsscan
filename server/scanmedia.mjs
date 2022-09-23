import createDebug from 'debug';
//const dtmp = createDebug('temp');
//const dlog = createDebug('log:scanMedia');
const debug = createDebug('debug:scanMedia');

//import * as manet from '../utils/mediaAreaNetFormats.mjs';
//const audios = manet.audiosFormats();
//const videos =  manet.videosFormats();

import process from 'node:process';
import * as path from 'node:path';
import {
    //saveResults,
    checkAndCreateOutputDir,
    saveObjToFile,
    OUTPUT_DIR_NAME,
} from '../utils/output.mjs';

const SCANMEDIA_OUTPUT = `${OUTPUT_DIR_NAME}scanMedia/`;
checkAndCreateOutputDir( SCANMEDIA_OUTPUT );

import { Scanner } from "../packages/Scanner/Scanner.mjs";

const OK_EXIT_CODE = 0;
const SIGINT_EXIT_CODE = 2 + 128;
const START_FOLDER_NAME = path.resolve( process.argv[2] ?? './' );

const scanner = new Scanner( START_FOLDER_NAME );


process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, throwing an error, or other logic here
});

let exitCode = OK_EXIT_CODE;

process.on( // For app termination
    'SIGINT',
    async (signal) => {
        exitCode = SIGINT_EXIT_CODE;
        console.log(`\b\b\x20\x20\nGot ${signal} signal (^C)!\n`);
        const output = await scanner.createResults(`Interrupt by user (${signal}).`);
        await saveObjToFile({
            objToSave: output,
            filenameGenerator
        });
        console.log(`Process finished (pid:${process.pid}, exit code: ${exitCode}).`);
        process.exit( exitCode );
    }
);

await (async function scanMedia (){
    try{
        const output = await scanner.start();

        //console.log('Result is empty. Saving canceled.');
        await saveObjToFile({
            objToSave: output,
            filenameGenerator
        });
    }
    catch (err) {
        exitCode = err.errno;
    }
})();

debug( global.performance );
console.log('end of script file.');
console.log(`Process finished (pid:${process.pid}, exit code: ${exitCode}).`);
process.exit( exitCode );


function filenameGenerator () {
    return `${OUTPUT_DIR_NAME}scanMedia/${outputFileName()}`;
}

function outputFileName () {
    let prefix = pathToKebabCase( START_FOLDER_NAME );
    let dt = (new Date).toISOString().
        split('.')[0].       // Delete ms '.270Z'
        replaceAll(':','')   // ':' - uncorrect symbol in Win
    ;
    return `[${prefix}]${dt}.json`;
}

function pathToKebabCase (path) {
    return path.replaceAll('/','-').
        replaceAll(':\\','-').
        replaceAll('\\','-')
    ;
}
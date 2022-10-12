import createDebug from 'debug';
//const dlog = createDebug('log:scanMedia');
//const debug = createDebug('temp');
const dbgPerf = createDebug('perf:scanMedia');

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


const OK_EXIT_CODE = 0;
const SIGINT_EXIT_CODE = 2 + 128;
const START_FOLDER_NAME = path.resolve( process.argv[2] ?? './' );

import scanner from "../packages/Scanner/default.mjs";


process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, throwing an error, or other logic here
});

let exitCode = OK_EXIT_CODE;

process.setMaxListeners( Infinity );

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
        const output = await scanner.scanning( START_FOLDER_NAME );

        //console.log('Result is empty. Saving canceled.');
        await saveObjToFile({
            objToSave: output,
            filenameGenerator
        });
    }
    catch (err) {
        console.log(`Error in main script: 'scanMedia'.`, err );
        exitCode = err.errno;
    }
})();

dbgPerf( global.performance );
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
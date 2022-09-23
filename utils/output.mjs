//import createDebug from 'debug';
//const dbg = createDebug('test');

import * as pfs from 'node:fs/promises';
import * as fs from 'node:fs';

const appRoot = fs.realpathSync( process.cwd() );
const OUTPUT_DIR_NAME = `${appRoot}/output/`;

function checkAndCreateOutputDir (dirName) {
    if( !fs.existsSync( dirName )){
        fs.mkdirSync( dirName );
        console.log('Создана папка для хранения результатов:', dirName );
    }
}
checkAndCreateOutputDir( OUTPUT_DIR_NAME );


async function summarize (info) {
    const parsed = await parseSettled( info );
    const {
        success, errors, total
    } = parsed;
    return `Total: ${total}, success: ${success}, errors: ${errors}`;
}

async function parseSettled (info) {
    let fulfilled = 0;
    let rejected = 0;
    for(
        const value of info
    ) {
        value.status == "fulfilled" && (fulfilled += 1);
        value.status == "rejected" && (rejected += 1 );
    }
    return({
        success: fulfilled,
        errors: rejected,
        total: info.length,
    });
}


async function saveObjToFile ({
    objToSave,
    filenameGenerator = outputPathName,
    validator = isValidInfo
}) {
    let filehandle;
    let fullname = filenameGenerator();
    try {
        if( !validator( objToSave )) {
            throw new Error('Invalid Info');
        }
        const info = JSON.stringify( objToSave, null, 4 );
        filehandle = await pfs.open( fullname, 'a+');
        await filehandle.write(`${info}`);
    }
    catch (err){
        console.log(`catch saveResults: "${fullname}"`);
        console.log( err );
        return err;
    }
    finally {
        if( filehandle ) {
            await filehandle?.close();
            console.log(`closed: ${fullname}`);
        }
    }
}

function outputPathName () {
    return OUTPUT_DIR_NAME + outputFileName();
}

function outputFileName (prefix='media') {
    let dt = (new Date).toISOString().
        split('.')[0].       // Delete ms '.270Z'
        replaceAll(':','')   // ':' - uncorrect symbol in Win
    ;
    return `${prefix}${dt}.json`;
}

const isNotEmptyArray = (obj) => Array.isArray(obj) && obj.length !== 0;
const isNotEmptyObject = (obj) => Object.keys(obj).length !== 0;

function isValidInfo (infoObj) {
    return typeof( infoObj ) == 'object'
        && ( isNotEmptyArray( infoObj ) || isNotEmptyObject( infoObj ))
    ;
}

async function saveResults (infoObj, summary, prefix='media') {

    //const UR_EVENT_NAME = 'unhandledRejection';
    //let urListener;
    let filehandle;
    let fullname = OUTPUT_DIR_NAME + outputFileName( prefix );
    try {
        if( !isValidInfo( infoObj )) {
            throw new Error('Invalid Info');
        }
        const info = JSON.stringify( infoObj, null, 4 );
        filehandle = await pfs.open( fullname, 'a+');
        let add = summary ? `\n"summary": "${summary}"\n` : '';
        await filehandle.write(`${info}${add}`);
        //urListener = process.rawListeners( UR_EVENT_NAME )?.at(-1);
    }
    catch (err){
        console.log(`catch saveResults: "${fullname}"`);
        console.log( err );
        return err;
    }
    finally {
        if( filehandle ) {
            await filehandle?.close();
            console.log(`closed: ${fullname}`);
        }
        //process.removeListener( UR_EVENT_NAME, urListener );
    }
}


export {
    OUTPUT_DIR_NAME,
    checkAndCreateOutputDir,
    saveObjToFile,
    saveResults,
    summarize,
    parseSettled,
    outputFileName,
};

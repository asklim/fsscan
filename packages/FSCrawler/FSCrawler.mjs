import createDebug from 'debug';
//const dtmp = createDebug('temp');
const dlog = createDebug('log:crawler');
const debug = createDebug('debug:crawler');

import * as path from 'node:path';
import * as pfs from 'node:fs/promises';
import EventEmitter from 'node:events';

export class FSCrawler extends EventEmitter {

    static ERROR_ENTRY    = Symbol('error-entry');
    static FOLDER_ENTRY   = Symbol('folder-entry');
    static FILE_ENTRY     = Symbol('file-entry');
    static UNKNOWN_ENTRY  = Symbol('unknown-entry');
    static END_OF_ENTRIES = Symbol('end-of-entries');

    #startFolder;
    #MAX_DEBUGLOG_LEVEL;

    constructor (
        startFolder,
        maxDebugLogLevel=2
    ) {
        super();
        this.#startFolder = startFolder;
        this.#MAX_DEBUGLOG_LEVEL = maxDebugLogLevel;
    }

    async start () {
        await this.#recursiveScanFolder( this.#startFolder );
        this.emit( FSCrawler.END_OF_ENTRIES );
    }

    async #recursiveScanFolder (dirName, level=0) {

        let directoryList = [];
        try {
            if( dirName.at(-1) !== '/' ) { dirName += '/'; }
            debug(`processing ${dirName}`);

            //const iterable = await enqueueFileInfoOf( dirName );
            //dtmp('iterable.next', iterable.next ); // [AsyncFunction: next]
            for await (
                //let info of iterable
                let info of promisesFileInfoOf( dirName )
                //let info of generatorFileInfoOf( dirName )
            ) {
                //dtmp('info', info );
                if( info ) {
                    if( info.error ){
                        this.emit( FSCrawler.ERROR_ENTRY, info );
                    }
                    else if( info.isDir ) {
                        directoryList.push( info.fullname );
                        this.emit( FSCrawler.FOLDER_ENTRY, info );
                    }
                    else if( info.isFile ){
                        this.emit( FSCrawler.FILE_ENTRY, info );
                    }
                    else {
                        this.emit( FSCrawler.UNKNOWN_ENTRY, info );
                    }
                }
            }
            //dtmp('dirLen', directoryList.length );

            for (
                const subdir of directoryList.sort()
            ) {
                const nextLevel = level + 1;
                if( nextLevel < this.#MAX_DEBUGLOG_LEVEL ) {
                    dlog(`[level.${nextLevel}] Scan starting of ${subdir}`);
                }
                // eslint-disable-next-line no-await-in-loop
                await this.#recursiveScanFolder( subdir, nextLevel );
            }
        }
        catch (err) {
            console.log(`FSCrawler.#recursiveScanFolder ${dirName}\n`, err.stack );
        }
    }
}




async function * promisesFileInfoOf (folder) {

    const fileNames = await pfs.readdir( folder );
    const promises = fileNames.map( (name) => {
        const fullname = path.resolve( folder, name );
        return getOneFileInfo( fullname );
    });
    //dtmp('promises', promises); // [Promise { <pending> }, ...]
    yield * promises;
}

/*
async function enqueueFileInfoOf (folder) {

    const q = new AsyncQueue();
    const fileNames = await pfs.readdir( folder );
    for ( let fname of fileNames ) {
        const fullname = path.resolve( folder, fname );
        q.enqueue( getOneFileInfo( fullname ));
    }
    //dtmp('*q', q );
    return q;
}

async function * generatorFileInfoOf (folder) {

    const fileNames = await pfs.readdir( folder );
    for (
        const fileName of fileNames
    ) {
        const fullname = path.resolve( folder, fileName );
        yield getOneFileInfo( fullname );
    }
}
*/


async function getOneFileInfo (fullname) {
    const NO_CATCH = [
        'ELOOP',
        'EIO',
        'ENXIO',
        'EPERM'
    ];
    let filehandle;
    try {
        filehandle = await pfs.open( fullname, 'r');
        const stats = await filehandle.stat();
        return ({
            fullname,
            isDir: stats.isDirectory(),
            isFile: stats.isFile(),
            //...stats
        });
    }
    catch (error) {
        if( !NO_CATCH.includes( error.code )) {
            error.utc = (new Date).toUTCString();
            return ({
                fullname,
                error
            });
        }
    }
    finally {
        filehandle && await filehandle?.close();
    }
}

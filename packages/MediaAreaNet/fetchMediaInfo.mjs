import createDebug from 'debug';
const dbgMain = createDebug('main');
const dbgTest = createDebug('test');

import * as pfs from 'node:fs/promises';

//import MediaInfo from 'mediainfo.js';
//console.log('MediaInfo is', typeof MediaInfo ); // function


/****************************************************
 * @returns {object}
    {
        "creatingLibrary": {
            "name": "MediaInfoLib",
            "version": "22.06",
            "url": "https://mediaarea.net/MediaInfo"
        },
        "media": {
            "@ref": "",
            "track": [
                {
                    "@type": "General",
                    "VideoCount": "1",
                    "AudioCount": "1",
                    "TextCount": "3",
                    "MenuCount": "1",
                    ...
                },
                {
                    "@type": "Video",
                    "ID": "1",
                    ...
                },
                {
                    "@type": "Audio",
                    "ID": "2",
                    ...
                }, ...
                {
                    "@type": "Text",
                    "ID": "5",
                    ...
                }, ...
                {
                    "@type": "Menu",
                    //* Not Present: "ID": "7", **
                    ...
                }, ...
            ]
        }
    }
 */
export default async function fetchMediaInfo (fullname, medianetLib) {

    const UR_EVENT_NAME = 'unhandledRejection';
    let filehandle;
    let urListeners = [];
    urListeners[0] = process.listenerCount( UR_EVENT_NAME );
    // let urListener;
    try {
        urListeners[1] = process.listenerCount( UR_EVENT_NAME );
        filehandle = await pfs.open( fullname, 'r');
        const stats = await filehandle.stat();
        dbgMain(`"${fullname}"`, stats );
        urListeners[2] = process.listenerCount( UR_EVENT_NAME );

        // urListener = process.rawListeners( UR_EVENT_NAME )?.at(-1);

        //dbgTest( medianetLib );
        const info = await medianetLib.analyzeData(
            () => stats.size,
            readChunk
        );

        return ({
            fullname,
            ...info
        });
    }
    catch (err){
        console.log(`catch fetchMediaInfo: "${fullname}"`);
        //err.mediaFilename = fullname;
        console.log( err );
        return err;
    }
    finally {
        await filehandle?.close();
        //process.removeListener( UR_EVENT_NAME, urListener );
        dbgMain(`closed: ${fullname}`);
        dbgTest(`MediaInfo.UR.listener's counts: ${urListeners}`);
    }

    async function readChunk( size, offset ) {
        const buffer = new Uint8Array( size );
        await filehandle.read( buffer, {
            length: size,
            position: offset
        });
        //dbg( size, offset, buffer );
        return buffer;
    }
}

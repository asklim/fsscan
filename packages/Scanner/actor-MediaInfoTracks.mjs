import createDebug from 'debug';
//const dbgMain = createDebug('main');
//const dbgTest = createDebug('test');
const dbgTemp = createDebug('temp');

import { AbstractActor } from './actor-Abstract.mjs';
import fetchMediaInfo from '../MediaAreaNet/fetchMediaInfo.mjs';
import hashMD5 from '../../utils/md5/index.mjs';

import MediaInfo from 'mediainfo.js';

export class MediaInfoTracks extends AbstractActor {

    #actorResults = [];
    //#medianetLib;
    #counter = 0;
    #mwInvoked = 0;
    constructor () {
        super();
        //this.#medianetLib = medianetLib;
    }

    keyName = () => 'MediaInfo.Tracks';

    middleware = async (fullname) => {
        //fullname = await fullname;
        this.#mwInvoked++;
        if ( fullname == undefined ) {
            return;
        }
        this.#counter++;
        dbgTemp(`MITracks.mw [${this.#counter}/${this.#mwInvoked}] ${fullname}`);
        //dbgTemp('MediaInfoTracks.middleware:', fullname );
        const medianetLib = await MediaInfo({ full: true });
        let info = await fetchMediaInfo( fullname, medianetLib );
        const result = this.#extractOutputInfo( info );

        // dbgTemp(`mediaInfoTracks.middleware`, fullname == result.fullname, fullname );

        this.#actorResults.push( result );
        this.incrementTotal();
        // dbgTemp(
        //     `MITracks.mw after result ` +
        //     `[${this.#counter}/${this.#mwInvoked}/${this.total()}]`
        // );

        return fullname;
    };

    results () {
        return [ ...this.#actorResults ].
            sort( compareEntryByFullname );
    }

    #extractOutputInfo (info) {
        let { fullname } = info;
        let general = info?.media?.track?.[0] ?? {};
        let md5 = hashMD5( fullname );
        return ({
            md5,
            fullname,
            "track.item0": {
                ['@type']:    general['@type'],
                "VideoCount": general.VideoCount,
                "AudioCount": general.AudioCount,
                "TextCount":  general.TextCount,
                "MenuCount":  general.MenuCount,
            }
        });

    }
}


function compareEntryByFullname (a, b) {
    if ( a.fullname > b.fullname ) { return 1; }
    if ( a.fullname < b.fullname ) { return -1; }
    return 0;
}
import createDebug from 'debug';
const dlog = createDebug('log:actor');
// const dbgTest = createDebug('test');
// const debug = createDebug('temp');

import { AbstractActor } from './actor-Abstract.mjs';
import fetchMediaInfo from '../MediaAreaNet/fetchMediaInfo.mjs';
import hashMD5 from '../../utils/md5/index.mjs';

import MediaInfo from 'mediainfo.js';

export class MediaInfoTracks extends AbstractActor {

    #actorResults = [];
    #medianetLib;
    #isAddToResult;
    #description;

    constructor ({ type } = { type: 'NoV_or_NoA' }) {
        super();
        if ( type == 'only_1V_and_1A' ) {
            this.#isAddToResult = isMoreThanOnlyOneVideoAndOneAudio;
            this.#description = 'More than one video and one audio track';
        } else {
            this.#isAddToResult = isNoVideoOrNoAudio;
            this.#description = 'NO video OR NO audio track';
        }
    }

    keyName = () => 'MediaInfo.Tracks';

    middleware = async (fullname) => {

        if ( fullname == undefined ) {
            return;
        }
        if ( !this.#medianetLib ) {
            this.#medianetLib = await MediaInfo({ full: true });
        }
        let info = await fetchMediaInfo( fullname, this.#medianetLib );

        if ( this.#isAddToResult( info )) {
            const result = this.#extractOutputInfo( info );
            dlog(`mediaInfoTracks: ${fullname}`);

            this.#actorResults.push( result );
            this.incrementTotal();
        }
        return fullname;
    };

    results () {
        this.#medianetLib?.close();
        return ({
            actor: this.#description,
            total: this.total(),
            results: [ ...this.#actorResults ].sort( compareEntryByFullname )
        });
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

function isMoreThanOnlyOneVideoAndOneAudio( info ) {
    let general = info?.media?.track?.[0] ?? {};
    let vc = general.VideoCount ?? 0;
    let ac = general.AudioCount ?? 0;
    let tc = general.TextCount ?? 0;
    let mc = general.MenuCount ?? 0;

    return (vc * ac != 1) || (tc+mc != 0);
}


function isNoVideoOrNoAudio( info ) {
    let general = info?.media?.track?.[0] ?? {};
    let vc = general.VideoCount ?? 0;
    let ac = general.AudioCount ?? 0;
    return vc == 0 || ac == 0;
}



import * as manet from '../MediaAreaNet/index.mjs';
import { Scanner } from "./Scanner.mjs";
import { FilterByExt } from './actor-FilterByExt.mjs';
import { MediaInfoTracks } from './actor-MediaInfoTracks.mjs';
import { FinalCounter } from './actor-FinalCounter.mjs';

//const audios = manet.audiosFormats();
const videosFormats = manet.videosFormats();

export function createDefault () {

    const scanner = new Scanner();

    scanner.useActor( new FilterByExt({
        exts: videosFormats,
        reportFormat: 'exts',
    }));
    scanner.useActor( new MediaInfoTracks());
    scanner.useActor( new FinalCounter());

    return scanner;
}

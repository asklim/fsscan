
import { Scanner } from "./Scanner.mjs";
const scanner = new Scanner();

import * as manet from '../MediaAreaNet/index.mjs';
//const audios = manet.audiosFormats();
const videosFormats = manet.videosFormats();

import { FilterByExt } from './actor-FilterByExt.mjs';
scanner.useActor( new FilterByExt({
    exts: videosFormats,
    reportFormat: 'exts',
}));

import { MediaInfoTracks } from './actor-MediaInfoTracks.mjs';
scanner.useActor( new MediaInfoTracks());


import { FinalCounter } from './actor-FinalCounter.mjs';
scanner.useActor( new FinalCounter());

export default scanner;

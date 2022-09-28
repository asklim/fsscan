let containers;

const knownContainers = [
    ['ext',  'mime',  'name', 'description'],
    ['mkv',  'video/x-matroska', 'Matroska/mkv', 'An MKV file is a video file saved in the Matroska multimedia container format. It supports several types of audio and video codecs and may include .SRT, .SSA, .USF (Universal Subtitle Format), or VobSub subtitles. MKV files are typically used for storing short video clips, TV shows, and movies.'
    ],
    ['mka',  'audio/x-matroska', 'Matroska/mka', 'An MKA file is an audio file saved in the Matroska multimedia container format. It supports several types of audio compression algorithms, including MP3, AAC, and Vorbis. MKA files are typically used for storing voice recordings and songs.'
    ],
    ['mks',  '', 'Matroska/mks', 'Subtitle container format developed by Matroska; contains only subtitles unlike the MKV format which can also contain video with the subtitles. The MKS file format is developed by Matroska, which is an extensible, open source, open standard multimedia container.'
    ],
    ['ogg',  'audio/ogg', 'Ogg', 'The Ogg container format is a multimedia format that supports multiple streams of video, audio, text, and metadata. The individual streams may be compressed with different compression methods, including Theora (video), Vorbis (audio), Opus (audio), FLAC (audio), and OggPCM (audio).'
    ],
    ['ogm',  'video/ogg', 'Ogg/ogm', 'Compressed video file that uses an altered form of Xiph.Org\'s Ogg file container format; supports playback of video content that incorporates DirectShow filters; created as an extension to the Ogg specification so that Windows Media Player (older versions) and other programs could easily play Ogg video and audio files.'
    ],
    ['avi',  'video', 'Riff', ''
    ],
    ['wav',  'video', 'Riff', ''
    ],
    ['mpeg', 'video', 'Mpeg 1&2', ''
    ],
    ['mpg',  'video', 'Mpeg 1&2', ''
    ],
    ['vob',  'video', 'Mpeg 1&2', ''
    ],
    ['mp4',  'video', 'Mpeg 4', ''
    ],
    ['mpgv', 'video', 'Mpeg video specific', ''
    ],
    ['mpv',  'video', 'Mpeg video specific', ''
    ],
    ['m1v',  'video', 'Mpeg video specific', ''
    ],
    ['m2v',  'video', 'Mpeg video specific', ''
    ],
    ['mp2',  'audio', 'Mpeg audio specific', ''
    ],
    ['mp3',  'audio', 'Mpeg audio specific', ''
    ],
    ['asf',  'audio', 'Windows Media', ''
    ],
    ['wma',  'audio', 'Windows Media', ''
    ],
    ['wmv',  'video', 'Windows Media', ''
    ],
    ['qt',   'video', 'Quicktime', ''
    ],
    ['mov',  'video', 'Quicktime', ''
    ],
    ['rm',   'video', 'Real', ''
    ],
    ['rmvb', 'video', 'Real', ''
    ],
    ['ra',   'audio', 'Real', ''
    ],
    ['ifo',  'video', 'DVD-Video', ''
    ],
    ['ac3',  'audio/ac3', 'AC3', ''
    ],
    ['dts',  'audio', 'DTS', ''
    ],
    ['aac',  'audio/aac', 'AAC', ''
    ],
    ['ape',  'audio', `Monkey's Audio`, ''
    ],
    ['mac',  'audio', `Monkey's Audio`, ''
    ],
    ['flac', 'audio', 'Flac', 'FLAC (Free Lossless Audio Codec)'
    ],
    ['dat',  'video', 'CDXA, like Video-CD', ''
    ],
    ['aiff', 'audio', 'Apple/SGI', ''
    ],
    ['aifc', 'audio', 'Apple/SGI', 'Compressed Audio Interchange File'
    ],
    ['au',   'audio/basic', 'Sun/NeXT', 'simply 8-bit μ-law-encoded data at an 8kHz sample rate'
    ],
    ['iff',  'application/x-iff', 'Amiga IFF/SVX8/SV16', 'Interchange File Format (IFF), is a generic container file format originally introduced by the Electronic Arts company in 1985'
    ],
    ['paf',  'audio', 'Ensoniq PARIS', 'Ensoniq Paris was a digital audio workstation available for PCs and Macintosh computers, sold by Ensoniq Corporation in 1998 and later by E-mu Systems.'
    ],
    ['sd2',  'audio', 'Sound Designer 2', 'A digital audio software application developed by Digidesign in the late 1980’s. '
    ],
    ['irca', 'audio', 'Berkeley/IRCAM/CARL', 'Sound file format developed by the IRCAM institute in Paris, France. It is primarily used to store CSound audio samples. IRCAM files are often saved as .SF files.'
    ],
    ['w64', 'audio', 'SoundFoundry WAVE 64', 'The Wave64 format was developed by Sonic Foundry but now is maintained by Sony. The official name of the format is Sony Picture Digital Wave 64.'
    ],
    ['mat', 'application/x-matlab', 'Matlab', 'Binary data container format used from MATLAB v.4. MAT-files may also be used to represent audio in 64-bit floating point, 16-bit signed integer, and 8-bit unsigned integer formats.'
    ],
    ['pvf', 'audio', 'Portable Voice format', 'It contains human speech, most likely recorded from a phone call using Mgetty-voice, also known as Vgetty, which is a software package used to create an answering machine on a Unix computer using a voice modem.'
    ],
    ['xi', 'audio', 'FastTracker2 Extended', 'An XI file is an instrument used by various audio tracker apps, including Starbreeze Studios Fasttracker 2 and Milkytracker. It stores information about an instrument, such as a kick drum or piano, in the Extended Instrument (XI) format, which is similar to the .XM module format. XI files include envelope and LFO settings and one or more WAVE samples (one per channel). '
    ],
    ['sds', 'audio', 'Midi Sample dump Format', 'MIDI format that contains standardized System Exclusive (SysEx) messages; may be "dumped" from an audio program or hardware device; supported by a variety of hardware and software samplers. SDS files do not contain actual audio data'
    ],
    ['avr', 'audio', 'Audio Visual Research', 'Audio file format created by Audio Visual Research for the older Atari ST computer systems; can be 8 or 16-bit and contain 1 or 2 channels; not commonly used anymore.'
    ]
];


(function createContainers([ headRow, ...initInfo ]) {
    //const headRow is initInfo[0];

    containers = initInfo.map(
        (val) => infoToObject( val, headRow )
    ).
    filter( Boolean );

    function infoToObject( info, header ) {
        let infoObj = {};
        for( let idx=0;
            idx < header.length;
            idx++
        ) {
            let key = header[ idx ];
            infoObj[ key ] = info[ idx ];
        }
        return infoObj;
    }
})( knownContainers );


export function videosFormats() {

    const formats = containers.map(
        ({ ext, mime }) => mime?.startsWith('video') ? ext : null
    ).
    filter( Boolean );
    return formats;
}


export function audiosFormats() {

    const formats = containers.map(
        ({ ext, mime }) => mime?.startsWith('audio') ? ext : null
    ).
    filter( Boolean );
    return formats;
}


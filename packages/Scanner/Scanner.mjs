import createDebug from 'debug';
const dtmp = createDebug('temp');
const dlog = createDebug('log:scanner');
const debug = createDebug('debug:scanner');

//import { AsyncQueue } from '../packages/AsyncQueue/AsyncQueue.mjs';
import { FSCrawler } from '../FSCrawler/FSCrawler.mjs';
import { CountingByExt } from './actor-CountingByExt.mjs';

export class Scanner {

    #logger;
    #startFolder;
    #actors = [];
    #output;

    constructor (startFolder, logger=console) {

        this.#logger = logger;
        this.#startFolder = startFolder;
        this.timeStart = new Date;
        this.summary = {
            startFolder: this.#startFolder,
            status: '',
            momentStart: this.timeStart.toUTCString(),
            momentStop: '',
            msElapsed: 0,
            total: {
                folders: 0,
                files: 0,
                errors: 0,
                unknown: 0,
            }
        };
        this.errorList = [];
        this.unknownList = [];

        this.#output = {
            summary: this.summary,
            errors:  this.errorList,
            unknown: this.unknownList,
        };

        this.#initCrawler();
        this.useActor( new CountingByExt );

    }

    async start () {
        let reason;
        try {
            await this.fsCrawler.start();
            reason = 'Completed successfull.';
        }
        catch (err) {
            this.#logger.log( err.stack );
            reason = 'Error occured.';
        }
        finally {
            // eslint-disable-next-line no-unsafe-finally
            return await this.createResults( reason );
        }
    }

    useActor (actor) {
        this.#actors.push( actor );
    }


    #updateSummary (reason) {
        let timeStop = (new Date);
        this.summary.status = this.summary.total.folders == 0 ?
            'Result is empty.'
            : reason
        ;
        this.summary.momentStop = timeStop.toUTCString();
        this.summary.msElapsed = timeStop - this.timeStart;
        this.summary.total.errors = this.errorList.length;
        this.summary.total.unknown = this.unknownList.length;
        this.#updateActorsTotals();
    }

    #updateActorsTotals () {
        for ( const actor of this.#actors ) {
            const key = actor.keyName();
            const section = this.#output?.[ key ];
            let fieldsCount = null;
            section && (fieldsCount = Object.keys( section ).length);
            this.summary.total[ key ] = fieldsCount;
            const actorTotal = actor?.total();
            (actorTotal !== undefined) &&
                (this.summary.total[ `${key}.total` ] = actorTotal);
        }
    }

    async createResults (reason) {

        for ( const actor of this.#actors ) {
            const key = actor.keyName();
            this.#output[ key ] = actor.results();
        }

        this.#updateSummary( reason );

        dtmp('output keys:', Object.keys( this.#output ));
        dlog( this.summary );

        return this.#output;
    }

    consolelogCounters () {
        this.#logger.log(
            'folders:',  this.summary.total.folders,
            'files:',    this.summary.total.files,
            'errors:',   this.errorList.length,
            'unknown:',  this.unknownList.length,
        );
    }

    #initCrawler () {
        this.fsCrawler = new FSCrawler( this.#startFolder );

        this.fsCrawler.addListener( FSCrawler.ERROR_EVENT, (info) => {
            let { fullname, error } = info;
            this.consolelogCounters();
            this.#logger.log(`[${error.utc}] get FileInfo ${fullname}\n`, error );
            this.errorList.push( info );
        });

        this.fsCrawler.addListener( FSCrawler.FOLDER_EVENT, (info) => {
            debug('folder event:', info.fullname );
            this.summary.total.folders += 1;
        });

        this.fsCrawler.addListener( FSCrawler.FILE_EVENT, (info) => {
            this.summary.total.files += 1;
            let value = info.fullname;
            for ( const actor of this.#actors ) {
                value = actor.middleware( value );
            }
        });

        this.fsCrawler.addListener( FSCrawler.UNKNOWN_EVENT, (info) => {
            this.unknownList.push( info );
        });
    }
}

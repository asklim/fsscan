import createDebug from 'debug';
const dbgTemp = createDebug('temp');
const dlog = createDebug('log:scanner');
const debug = createDebug('debug:scanner');

import { AsyncQueue } from '../AsyncQueue/AsyncQueue.mjs';
import { FSCrawler } from '../FSCrawler/FSCrawler.mjs';
import { CountingByExt } from './actor-CountingByExt.mjs';
import asyncConsistently from '../../utils/async-consistently.mjs';
export class Scanner {

    #actors = [];
    #logger;
    #startFolder;
    #output;
    #filesQueue;

    constructor (logger=console) {

        this.#logger = logger;
        this.#filesQueue = new AsyncQueue();

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

        this.useActor( new CountingByExt );
    }

    async scanning (startFolder) {
        this.#startFolder = startFolder;
        this.#initCrawler();

        let reason;
        try {
            this.fsCrawler.start();
            dlog(`[start()] #before for/async; queue: ${this.queueLength()}`);

            const asyncFns = this.#actors.map( (actor) => actor.middleware );

            for await (
                const info of this.#filesQueue
            ) {
                await asyncConsistently( asyncFns, info.fullname );
            }

            reason = 'Completed successfull.';
        }
        catch (err) {
            this.#logger.log('[start()]#catch Error:', err );
            reason = 'Error occured.';
        }
        finally {
            dlog(`[Scanner.start()]#finally; queue: ${this.queueLength()}`);
            // eslint-disable-next-line no-unsafe-finally
            return await this.createResults( reason );
        }
    }

    queueLength () {
        return this.#filesQueue.values?.length;
    }

    useActor (actor) {
        return this.#actors.push( actor );
    }

    async createResults (reason) {

        for (
            const actor of this.#actors
        ) {
            const key = actor.keyName();
            this.#output[ key ] = actor.results();
        }

        this.#updateSummary( reason );

        dbgTemp('output keys:', Object.keys( this.#output ));
        dlog( this.summary );

        return this.#output;
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

        const sectionLength = (key) => {
            const section = this.#output?.[ key ];
            let fieldsCount = null;
            section && (fieldsCount = Object.keys( section ).length);
            return fieldsCount;
        };

        for (
            const actor of this.#actors
        ) {
            const key = actor.keyName();
            this.summary.total[ key ] = sectionLength( key );
            const actorTotal = actor?.total();
            (actorTotal !== undefined) &&
                (this.summary.total[ `${key}.total` ] = actorTotal);
        }
    }

    #initCrawler () {
        this.fsCrawler = new FSCrawler( this.#startFolder );

        this.fsCrawler.addListener( FSCrawler.ERROR_ENTRY, (info) => {
            let { fullname, error } = info;
            this.#consolelogCounters();
            this.#logger.log(`[${error.utc}] get FileInfo ${fullname}\n`, error );
            this.errorList.push( info );
        });

        this.fsCrawler.addListener(
            FSCrawler.FOLDER_ENTRY,
            (info) => {
                debug('folder event:', info.fullname );
                this.summary.total.folders += 1;
            }
        );
        this.fsCrawler.addListener(
            FSCrawler.FILE_ENTRY,
            (info) => {
                this.summary.total.files += 1;
                this.#filesQueue.enqueue( info );
            }
        );
        this.fsCrawler.addListener(
            FSCrawler.UNKNOWN_ENTRY,
            (info) => this.unknownList.push( info )
        );
        this.fsCrawler.addListener(
            FSCrawler.END_OF_ENTRIES,
            () => this.#filesQueue.enqueue( AsyncQueue.EOQ )
        );
    }

    #consolelogCounters () {
        this.#logger.log(
            'folders:',  this.summary.total.folders,
            'files:',    this.summary.total.files,
            'errors:',   this.errorList.length,
            'unknown:',  this.unknownList.length,
        );
    }
}

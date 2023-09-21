import { DecayCache } from "./cache";
import { Deque } from "./queue";

export interface RateLimiter {
    hit(key: string): boolean;
}

/**
 * Type definition for the configuration of a TimeBasedLimiter.
 * Maps timeframes (in milliseconds) to the number of allowed requests within that timeframe.
 * 
 * @typedef {Object} TimeBasedLimiterConfig
 * 
 * @property {number} key - The timeframe in milliseconds.
 * @property {number} value - The number of allowed requests within the timeframe.
 */
export type TimeBasedLimiterConfig = {
    [key: number]: number
};

/**
 * Class implementing a time-based rate limiter.
 * Allows requests based on specified timeframes and their respective limits.
 */
export class TimeBasedLimiter implements RateLimiter {
    private timeframes: number[] = [];
    private limits: number[] = [];
    private queues: DecayCache<Deque<number>[]>;

    /**
     * Creates an instance of the TimeBasedLimiter class with specified timeframes and limits.
     * 
     * @param {TimeBasedLimiterConfig} config - The configuration mapping timeframes to their respective limits.
     */
    constructor(config: TimeBasedLimiterConfig, capacity: number) {
        for (const tf in config) {
            this.timeframes.push(parseInt(tf));
            this.limits.push(config[tf]);
        }
        this.queues = new DecayCache<Deque<number>[]>(capacity);
    }

    /**
     * Initializes the request queues for a specific key.
     * Each key will have multiple queues, each corresponding to a specific timeframe and its limit.
     * 
     * @private
     * @returns {Deque<number>[]} An array of deques representing the request queues for the key.
     */
    private initKey(): Deque<number>[] {
        let queues = new Array<Deque<number>>(this.timeframes.length);
        for (let i = 0; i < this.timeframes.length; i++) {
            queues[i] = new Deque(this.limits[i]);
        }
        return queues;
    }

    /**
     * Makes a request within the rate limiter.
     * Checks if the request is allowed based on the timeframes and their limits.
     * 
     * @returns {boolean} True if the request is allowed, otherwise false.
     */
    hit(key: string): boolean {
        let queues = this.queues.get(key);
        if (!queues) {
            queues = this.initKey();
            this.queues.put(key, queues);
        }
        let now = Date.now();
        for (let i = 0; i < this.timeframes.length; i++) {
            let tf = this.timeframes[i],
                q = queues[i];
            while (q.count() > 0) {
                let ts = q.peekFirst();
                if (ts && ts < now - tf) {
                    q.shift();
                } else {
                    break;
                }
            }
            if (!q.add(now)) {
                return false;
            }
        }
        return true;
    }
}

/**
 * Class implementing a decay-based rate limiter.
 * Limits requests based on a decay function over time.
 */
export class DecayLimiter implements RateLimiter {
    private decays: DecayCache<any>;
    private limit: number;

    /**
     * Creates an instance of the DecayLimiter class with specified configuration.
     * Initializes the decay cache to manage the request scores and sets the half-life and limit properties.
     * 
     * @param {number} capacity - The maximum capacity for the decay cache to store request scores.
     * @param {number} halfLife - The time period (in milliseconds) over which the scores decay.
     * @param {number} limit - The maximum score allowed for a request to be considered valid.
     */
    constructor(capacity: number, halfLife: number, limit: number) {
        this.decays = new DecayCache<any>(capacity, halfLife);
        this.limit = limit;
    }

    /**
     * Processes a request for a specific key within the rate limiter.
     * The request's score decays over time and is adjusted based on subsequent requests.
     * Checks if the request's score is below the set limit to determine if it's allowed.
     * 
     * @param {string} key - The key for which the request is made.
     * @returns {boolean} True if the request is allowed based on its decayed score, otherwise false.
     */
    hit(key: string): boolean {
        let score = this.decays.hit(key);
        if (!score) {
            this.decays.put(key, undefined);
            score = 1;
        }
        return score <= this.limit;
    }
}
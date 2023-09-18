import { LRUCache } from "./cache";
import { Deque } from "./queue";

export interface RateLimiter {
    hit(key: string): boolean;
}

export type TimeBasedLimiterConfig = {
    [key: number]: number
};

export class TimeBasedLimiter implements RateLimiter {
    private timeframes: number[];
    private limits: number[];
    private queues: LRUCache<Deque<number>[]>;

    constructor(config: TimeBasedLimiterConfig, capacity: number) {
        for (const tf in config) {
            this.timeframes.push(parseInt(tf));
            this.limits.push(config[tf]);
        }
        this.queues = new LRUCache<Deque<number>[]>(capacity);
    }

    private initKey(): Deque<number>[] {
        let queues = new Array<Deque<number>>(this.timeframes.length);
        for (let i = 0; i < this.timeframes.length; i++) {
            queues[i] = new Deque(this.limits[i]);
        }
        return queues;
    }

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
                let ts = q.peek();
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


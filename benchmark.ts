import { Cache, LRUCache, DecayCache } from ".";

const TEST_COUNT = [10000, 100000, 1000000, 10000000];
const CAPACITY = [1000, 10000, 100000, 1000000];
const CACHE_TYPES: string[] = ["lru", "decay"];

function createCache<T>(capacity: number, cType: string): Cache<T> | undefined {
    switch (cType) {
        case "lru":
            return new LRUCache<T>(capacity);
        case "decay":
            return new DecayCache<T>(capacity);
    }
}

let read = new Array(CAPACITY.length),
    write = new Array(CAPACITY.length);

for (var ctype of CACHE_TYPES) {
    let minRead = Number.POSITIVE_INFINITY,
    minWrite = Number.POSITIVE_INFINITY;
    console.log(`${ctype}:`);
    for (var count = 0; count < TEST_COUNT.length; count++) {
        for (var cap = 0; cap < CAPACITY.length; cap++) {

            let lru = createCache<string>(CAPACITY[cap], ctype),
                keys: string[] = [],
                values: string[] = [];

            for (var i = 1; i < 2000; i++) {
                keys.push(i.toString());
            }
            for (var i = 1; i < 4000; i++) {
                values.push(Math.floor(Math.random() * 99999999).toString());
            }

            let start = Date.now();
            for (var i = 0; i < TEST_COUNT[count]; i++) {
                let v = Math.floor(Math.random() * values.length);
                lru?.put(keys[i % keys.length], values[v]);
            }
            let duration = Date.now() - start,
                tps = TEST_COUNT[count] * 1000 / duration;
            if (tps < minWrite) {
                minWrite = tps;
            }
            write[cap] = Math.floor(tps);

            start = Date.now();
            for (var i = 0; i < TEST_COUNT[count]; i++) {
                lru?.get(keys[i % keys.length]);
            }
            duration = Date.now() - start;
            tps = TEST_COUNT[count] * 1000 / duration;
            if (tps < minRead) {
                minRead = tps;
            }
            read[cap] = Math.floor(tps);
        }
        let out: string[] = []
        for (var cap = 0; cap < CAPACITY.length; cap++) {
            out.push(`${read[cap].toLocaleString()}/${write[cap].toLocaleString()}`);
        }
        console.log(out.join(" "));
    }
    console.log(`Slowest: ${(Math.round(minWrite * 100) / 100).toLocaleString()} write/s - ${(Math.round(minRead * 100) / 100).toLocaleString()} read/s`);
}

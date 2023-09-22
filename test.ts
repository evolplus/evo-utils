const CAPACITY = 1000;
const LOOP = 1000;

const CACHE_TYPES: string[] = ["lru", "decay"];

import { Cache, LRUCache, DecayCache } from '.';

function createCache<T>(capacity: number, cacheType: string): Cache<T> | undefined {
    switch (cacheType) {
        case "lru":
            return new LRUCache<T>(capacity);
        case "decay":
            return new DecayCache<T>(capacity);
    }
}

for (var ctype of CACHE_TYPES) {
    console.log(`${ctype}:`);
    let cache = createCache<string>(CAPACITY, ctype),
        keys: string[] = [],
        values: string[] = [];

    for (var i = 1; i < CAPACITY * 2; i++) {
        keys.push(i.toString());
    }
    for (var i = 1; i < CAPACITY * 10; i++) {
        values.push(Math.floor(Math.random() * 99999999).toString());
    }


    let passed = 0, all: { [key: string]: boolean } = {};
    for (var i = 0; i < LOOP; i++) {
        let check: { [key: string]: string } = {};
        for (var j = 0; j < CAPACITY; j++) {
            let k = keys[Math.floor(Math.random() * keys.length)],
                v = values[Math.floor(Math.random() * keys.length)];
            all[k] = true;
            check[k] = v;
            cache?.put(k, v);
        }
        let maxItems = Object.keys(all).length;
        if (maxItems > CAPACITY) {
            maxItems = CAPACITY;
        }
        let ok = true;
        for (var k of Object.keys(check)) {
            let v = cache?.get(k);
            if (v != check[k]) {
                console.log(`${v} vs ${check[k]}`);
                ok = false;
                break;
            }
        }
        if (ok && cache!.count() == maxItems) {
            passed++;
        } else {
            console.log(`Failed at step ${i} (count=${cache!.count()})!`);
        }
    }
    console.log(`Passed ${passed}/${LOOP}`);
}
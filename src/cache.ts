/**
 * Interface defining the standard operations for a cache.
 * 
 * @interface
 * @template T The type of items that the cache will store.
 */
export interface Cache<T> {
    put(key: string, value: T, expiry?: number): void;
    get(key: string): T | undefined;
    delete(key: string): void;
    capacity(): number;
    count(): number;
}

/**
 * Type definition for an individual cache item.
 * 
 * @typedef {Object} CacheItem
 * @template T The type of the cache item's value.
 * 
 * @property {string} [key] - The key associated with the cache item.
 * @property {T} [value] - The value of the cache item.
 * @property {number} [expiry] - The expiry time of the cache item.
 * @property {number} [score] - The score associated with the cache item (used in certain cache types).
 * @property {number} lastUpdate - The timestamp of the last update to the cache item.
 * @property {CacheItem} [prev] - Pointer to the previous cache item.
 * @property {CacheItem} [next] - Pointer to the next cache item.
 */
type CacheItem<T> = {
    key?: string;
    value?: T;
    expiry?: number;
    score?: number;
    lastUpdate: number;
    prev?: CacheItem<T>;
    next?: CacheItem<T>;
};

/**
 * Abstract class representing the basic structure and functionality of a cache.
 * Provides foundational methods and properties for specific cache implementations.
 * 
 * @abstract
 * @template T The type of items that the cache will store.
 */
abstract class BasicCache<T> implements Cache<T> {
    private map: { [key: string]: CacheItem<T> } = {};
    private _capacity: number;
    private _count: number;

    // head of the linked list, which has the top priority for keeping in the cache 
    protected head: CacheItem<T>;

    // tail of the linked list, which has the lowest priority for keeping in the cache 
    protected tail: CacheItem<T>;

    /**
     * Creates an instance of the BasicCache class.
     * Initializes the cache with a specified capacity and sets up head and tail pointers for cache item order.
     * 
     * @param {number} capacity - The maximum number of items the cache can hold.
     */
    constructor(capacity: number) {
        this._capacity = capacity;
        this._count = 0;
        this.head = {
            lastUpdate: 0
        }
        this.tail = {
            prev: this.head,
            lastUpdate: 0
        }
        this.head.next = this.tail;
    }

    /**
     * Adds an item to the cache or updates an existing item's value.
     * If the cache reaches its capacity, it evicts an item based on the specific cache's eviction policy.
     * 
     * @param {string} key - The key associated with the item.
     * @param {T} value - The value to be stored in the cache.
     * @param {number} [expiry] - Optional expiry time for the item.
     */
    put(key: string, value: T, expiry?: number): void {
        let item: CacheItem<T> | undefined = this.map[key];
        if (!item) {
            item = {
                key: key,
                value: value,
                lastUpdate: Date.now()
            };
            if (this._count == this._capacity) {
                this.remove(this.tail.prev!);
            } else {
                this._count++;
            }
            this.map[key] = item;
            this.attachItem(item);
        } else {
            item.value = value;
            item.lastUpdate = Date.now();
        }
        if (expiry) {
            item.expiry = Date.now() + expiry;
        } else {
            item.expiry = 0;
        }
    }

    /**
     * Retrieves an item from the cache based on its key.
     * 
     * @param {string} key - The key associated with the item to be retrieved.
     * @returns {T | undefined} The value of the item if it exists, or undefined if it doesn't.
     */
    get(key: string): T | undefined {
        let item = this.map[key];
        if (item) {
            if (item.key && item.expiry && item.expiry < Date.now()) {
                delete this.map[key];
                this.remove(item);
            } else {
                this.hitItem(item);
                return item.value;
            }
        }
    }

    /**
     * Check a key is in the cache or not.
     * 
     * @param {string} key - The key associated with the item to be checked.
     * @returns {boolean} True if the key is in the cache, otherwise false.
     */
    contains(key: string): boolean {
        let item = this.map[key];
        if (item) {
            if (item.key && item.expiry && item.expiry < Date.now()) {
                delete this.map[key];
                this.remove(item);
            } else {
                return true;
            }
        }
        return false;
    }

    /**
     * Removes an item from the cache based on its key.
     * 
     * @param {string} key - The key associated with the item to be removed.
     */
    delete(key: string): void {
        let item = this.map[key];
        if (item) {
            this.remove(item);
            delete this.map[key];
        }
    }

    /**
     * Protected method that remove a cache item from the linked list. 
     * @param item Item being to be removed.
     */
    protected remove(item: CacheItem<T>): void {
        let prev = item.prev;
        if (prev && item.next) {
            prev.next = item.next;
            item.next.prev = prev;
        }
    }

    /**
     * Protected method that insert a cache item just after another item in the linked list.
     * @param item The item which already is in the list. The new item will be inserted at the position right after this item. 
     * @param newItem The item that will be inserted into the list.
     */
    protected insertAfter(item: CacheItem<T>, newItem: CacheItem<T>): void {
        newItem.next = item.next;
        newItem.prev = item;
        item.next!.prev = newItem;
        item.next = newItem;

    }

    /**
     * Protected function that allow caller to query a cache item by its key.
     * @param key The key for querying.
     * @returns The cache item if it is found, otherwise returns undefined.
     */
    protected getItem(key: string): CacheItem<T> | undefined {
        return this.map[key];
    }

    /**
     * Returns the maximum capacity of the cache.
     * 
     * @returns {number} The maximum number of items the cache can hold.
     */
    capacity(): number {
        return this._capacity;
    }

    /**
     * Returns the current number of items in the cache.
     * 
     * @returns {number} The number of items currently stored in the cache.
     */
    count(): number {
        return this._count;
    }

    /**
     * Abstract method that implements the attaching of a new cache item.
     * @param item The cache item that will be attached to the linked list.
     */
    protected abstract attachItem(item: CacheItem<T>): void;
    /**
     * Abstract method that implements the logics of a cache item when it is hit by read.
     * @param item The cache item that will be calculated and/or processed.
     */
    protected abstract hitItem(item: CacheItem<T>): void;
}

/**
 * LRUCache class that extends BasicCache to implement the Least Recently Used (LRU) cache eviction policy.
 * Items that are accessed recently are moved to the front, 
 * and the least recently used items are removed when the cache reaches its capacity.
 * 
 * @extends {BasicCache<T>}
 * @template T The type of items that the cache will store.
 */
export class LRUCache<T> extends BasicCache<T> implements Cache<T> {
    /**
     * Creates an instance of the LRUCache class with a specified capacity.
     * 
     * @param {number} capacity - The maximum number of items the cache can hold.
     */
    constructor(capacity: number) {
        super(capacity);
    }

    protected attachItem(item: CacheItem<T>): void {
        this.insertAfter(this.head, item); // always insert to the head
    }

    protected hitItem(item: CacheItem<T>): void {
        this.remove(item);
        this.insertAfter(this.head, item); // always insert to the head
    }

}

/**
 * DecayCache class that extends BasicCache to implement a decay-based cache eviction policy.
 * Cache items have a score which decays over time. The score increases with each access,
 * and the item's position in the cache is adjusted based on its score relative to other items.
 * 
 * @extends {BasicCache<T>}
 * @template T The type of items that the cache will store.
 */
export class DecayCache<T> extends BasicCache<T> implements Cache<T> {
    private halfLife: number;

    /**
     * Creates an instance of the DecayCache class with a specified capacity and half-life.
     * 
     * @param {number} capacity - The maximum number of items the cache can hold.
     * @param {number} [halfLife=300000] - The time (in milliseconds) after which the score of a cache item is halved.
     */
    constructor(capacity: number, halfLife: number = 300000) {
        super(capacity);
        this.halfLife = halfLife;
    }

    /**
     * 
     * @param item Calculate decay of an item.
     * @param ts Timestamp of the time when this item is calculated.
     */
    private calculate(item: CacheItem<T>, ts: number): void {
        let delta = (item.lastUpdate - ts) / this.halfLife;
        item.lastUpdate = ts;
        item.score = item.score ? item.score * Math.pow(2, delta) : 0;
    }

    protected attachItem(item: CacheItem<T>): void {
        // calculate the decay score of the item and find a right position for it to make the list in order.
        item.score = 1;
        let next: CacheItem<T> = this.head.next!,
            now = Date.now();
        while (next != this.tail) {
            this.calculate(next!, now);
            if (next.score! < 1) {
                break;
            }
            next = next.next!;
        }
        this.insertAfter(next.prev!, item);
    }

    protected hitItem(item: CacheItem<T>): void {
        // calculate the decay score of the item and items before it, then move it to the right postion to make the list in order.
        let now = Date.now();
        this.calculate(item, now);
        item.score! += 1;
        let prev = item.prev!;
        while (prev != this.head && prev.score! < item.score!) {
            prev = prev.prev!;
        }
        if (prev != item.prev) {
            this.remove(item);
            this.insertAfter(prev, item);
        }
    }

    /**
     * A special method for DecayCache class.
     * @param key The key to be hit
     * @returns The decay score of the key.
     */
    hit(key: string): number {
        let item = this.getItem(key),
            now = Date.now();
        if (item) {
            this.calculate(item, now);
            item.score! += 1;
            return item.score!;
        }
        return 0;
    }
}

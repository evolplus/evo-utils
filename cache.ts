export interface Cache<T> {
    put(key: string, value: T, expiry?: number): void;
    get(key: string): T | undefined;
    delete(key: string): void;
    capacity(): number;
    count(): number;
}

type CacheItem<T> = {
    key?: string;
    value?: T;
    expiry?: number;
    score?: number;
    lastUpdate: number;
    prev?: CacheItem<T>;
    next?: CacheItem<T>;
};

abstract class BasicCache<T> implements Cache<T> {
    private map: { [key: string]: CacheItem<T> } = {};
    private _capacity: number;
    private _count: number;
    protected head: CacheItem<T>;
    protected tail: CacheItem<T>;

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
    delete(key: string): void {
        let item = this.map[key];
        if (item) {
            this.remove(item);
            delete this.map[key];
        }
    }
    protected remove(item: CacheItem<T>): void {
        let prev = item.prev;
        if (prev && item.next) {
            prev.next = item.next;
            item.next.prev = prev;
        }
    }
    protected insertAfter(item: CacheItem<T>, newItem: CacheItem<T>): void {
        newItem.next = item.next;
        newItem.prev = item;
        item.next!.prev = newItem;
        item.next = newItem;

    }
    capacity(): number {
        return this._capacity;
    }
    count(): number {
        return this._count;
    }
    protected abstract attachItem(item: CacheItem<T>): void;
    protected abstract hitItem(item: CacheItem<T>): void;
}

export class LRUCache<T> extends BasicCache<T> implements Cache<T> {
    constructor(capacity: number) {
        super(capacity);
    }

    protected attachItem(item: CacheItem<T>): void {
        this.insertAfter(this.head, item); // always insert to the head
    }
    protected hitItem(item: CacheItem<T>): void {
        this.insertAfter(this.head, item); // always insert to the head
    }

}

export class DecayCache<T> extends BasicCache<T> implements Cache<T> {
    private halfLife: number;

    constructor(capacity: number, halfLife: number = 300000) {
        super(capacity);
        this.halfLife = halfLife;
    }
    private calculate(item: CacheItem<T>, ts: number): void {
        let delta = (item.lastUpdate - ts) / this.halfLife;
        item.lastUpdate = ts;
        item.score = item.score ? item.score * Math.pow(2, delta) : 0;
    }
    protected attachItem(item: CacheItem<T>): void {
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
}

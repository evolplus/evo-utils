export class Deque<T> {
    private list: T[];
    private head: number;
    private tail: number;

    constructor(capacity: number) {
        this.list = new Array<T>(capacity);
        this.head = 0;
        this.tail = 0;
    }

    add(value: T): boolean {
        let next = (this.tail + 1) % this.list.length;
        if (next == this.head) {
            // queue is already full, not add new element and return false
            return false;
        }
        this.list[this.tail] = value;
        this.tail = next;
        return true;
    }

    peek(): T | undefined {
        if (this.tail != this.head) {
            return this.list[this.head];
        }
    }    

    shift(): T | undefined {
        if (this.tail != this.head) {
            let val = this.list[this.head];
            this.head = (this.head + 1) % this.list.length;
            return val;
        }
    }

    pop(): T | undefined {
        if (this.tail != this.head) {
            let  last = (this.tail + this.list.length - 1) % this.list.length;
            this.tail = last;
            return this.list[last];
        }
    }

    count(): number {
        return (this.tail + this.list.length - this.head) % this.list.length;
    }
}
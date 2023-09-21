/**
 * Class representing a Double Ended Queue (Deque).
 * Allows insertion and removal of elements from both ends of the queue.
 * 
 * @template T The type of elements that the deque will store.
 */
export class Deque<T> {
    private list: T[]; // The underlying list used to store the elements of the deque.
    private head: number; // Pointer to the front of the deque.
    private tail: number; // Pointer to the end of the deque.

    /**
     * Creates an instance of the Deque class with a specified capacity.
     * Initializes the deque with an empty list and sets head and tail pointers.
     * 
     * @param {number} capacity - The initial capacity of the deque.
     */
    constructor(capacity: number) {
        this.list = new Array<T>(capacity);
        this.head = 0;
        this.tail = 0;
    }

    /**
     * Checks if the deque is full.
     * 
     * @returns {boolean} True if the deque has reached its capacity, otherwise false.
     */
    isEmpty(): boolean {
        return this.head == this.tail;
    }

    /**
     * Appends an element at the end of the deque.
     * 
     * @param {T} item - The element to be appended.
     * @returns {boolean} Returns true if successfully, otherwise (the deque is full) it will returns false.
     */
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

    /**
     * Returns the element at the front of the deque without removing it.
     * 
     * @returns {T | undefined} The element at the front of the deque, or undefined if the deque is empty.
     */
    peek(): T | undefined {
        if (this.tail != this.head) {
            return this.list[this.head];
        }
    }    

    /**
     * Removes and returns the element at the front of the deque.
     * 
     * @returns {T | undefined} The element at the front of the deque, or undefined if the deque is empty.
     */
    shift(): T | undefined {
        if (this.tail != this.head) {
            let val = this.list[this.head];
            this.head = (this.head + 1) % this.list.length;
            return val;
        }
    }

    /**
     * Removes and returns the element at the end of the deque.
     * 
     * @returns {T | undefined} The element at the end of the deque, or undefined if the deque is empty.
     */
    pop(): T | undefined {
        if (this.tail != this.head) {
            let  last = (this.tail + this.list.length - 1) % this.list.length;
            this.tail = last;
            return this.list[last];
        }
    }

    /**
     * Returns the current number of elements in the deque.
     * 
     * @returns {number} The number of elements currently stored in the deque.
     */
    count(): number {
        return (this.tail + this.list.length - this.head) % this.list.length;
    }
}
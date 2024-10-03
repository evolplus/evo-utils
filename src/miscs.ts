export function clone(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(clone);
    }
    if (obj === null || obj === undefined || typeof obj !== 'object') {
        return obj;
    }
    let keys = Object.keys(obj),
        copy:any = {};
    for (let i = 0; i < keys.length; i++) {
        copy[keys[i]] = clone(obj[keys[i]]);
    }
    return copy;
}
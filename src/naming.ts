export enum NamingConvention {
    CamelCase = 'camelCase',
    SnakeCase = 'snake_case',
    KebabCase = 'kebab-case',
    PascalCase = 'PascalCase',
    UpperSnakeCase = 'UPPER_SNAKE_CASE',
    UpperKebabCase = 'UPPER-KEBAB-CASE'
}

type NamingFunction = (parts: string[]) => string;
type BuidPartsFunction = (name: string) => string[];

export type NamingConverter = (name: string, from: NamingConvention, to: NamingConvention) => string;
export type ObjectConverter = (obj: any) => any;

const CONVERSIONS: { [key in NamingConvention]: NamingFunction } = {
    [NamingConvention.CamelCase]: (parts: string[]) => {
        return parts[0].toLowerCase() + parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
    },
    [NamingConvention.SnakeCase]: (parts: string[]) => {
        return parts.join('_').toLowerCase();
    },
    [NamingConvention.KebabCase]: (parts: string[]) => {
        return parts.join('-').toLowerCase();
    },
    [NamingConvention.PascalCase]: (parts: string[]) => {
        return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
    },
    [NamingConvention.UpperSnakeCase]: (parts: string[]) => {
        return parts.join('_').toUpperCase();
    },
    [NamingConvention.UpperKebabCase]: (parts: string[]) => {
        return parts.join('-').toUpperCase();
    }
};
const BUILD_PARTS: { [key in NamingConvention]: BuidPartsFunction } = {
    [NamingConvention.CamelCase]: (name: string) => {
        return name.split(/(?=[A-Z])/).map(p => p.toLowerCase());
    },
    [NamingConvention.SnakeCase]: (name: string) => {
        return name.split('_');
    },
    [NamingConvention.KebabCase]: (name: string) => {
        return name.split('-');
    },
    [NamingConvention.PascalCase]: (name: string) => {
        return name.split(/(?=[A-Z])/);
    },
    [NamingConvention.UpperSnakeCase]: (name: string) => {
        return name.split('_');
    },
    [NamingConvention.UpperKebabCase]: (name: string) => {
        return name.split('-');
    }
};

export function convertName(name: string, from: NamingConvention, to: NamingConvention): string {
    return CONVERSIONS[to](BUILD_PARTS[from](name));
}

export function convertObject(obj: any, from: NamingConvention, to: NamingConvention): any {
    if (Array.isArray(obj)) {
        return obj.map(o => convertObject(o, from, to));
    }
    if (obj === null || obj === undefined || typeof obj !== 'object') {
        return obj;
    }
    let keys = Object.keys(obj),
        copy: any = {};
    for (let i = 0; i < keys.length; i++) {
        copy[convertName(keys[i], from, to)] = convertObject(obj[keys[i]], from, to);
    }
    return copy;
}

export function createConverter(fields: string[] | readonly string[], from: NamingConvention, to: NamingConvention, reversed: boolean = false): ObjectConverter {
    let mapping: Record<string, string> = {};
    fields.forEach(f => {
        if (reversed) {
            mapping[convertName(f, from, to)] = f;
        } else {
            mapping[f] = convertName(f, from, to);
        }
    });
    return (obj: any) => {
        let result: any = {};
        for (let key in mapping) {
            result[mapping[key]] = obj[key];
        }
        return result;
    }
}
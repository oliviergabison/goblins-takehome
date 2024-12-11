declare module 'json2csv' {
    type ParseOptions = object; // or use 'unknown' if you want to allow any value

    export function parse(data: object[], opts?: ParseOptions): string;
}

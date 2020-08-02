import {ChangeEvent} from "react";

export type Filters = {[key: string]: Function}

export function addFilter(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, filters: Filters, key: string, empty: any, filter: Function) {
    const v = event.currentTarget.value;
    const copy = {...filters};
    if (v === empty) {
        delete copy[key];
    } else {
        copy[key] = (each: any) => filter(each, v);
    }
    return copy;
}
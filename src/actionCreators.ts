import { SHARED, CLIENT } from './tags';

export const shared =
    (actionCreator: Function) => (...args: any[]) => ({
        [SHARED]: true,
        ...actionCreator(...args)
    });

export const client =
    (actionCreator: Function) => (...args: any[]) => ({
        [SHARED]: true,
        [CLIENT]: true,
        ...actionCreator(...args)
    });
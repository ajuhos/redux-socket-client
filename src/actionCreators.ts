import { SHARED, CLIENT } from './tags';
import {CONNECT} from "./actions";

export const shared =
    <T extends (...args: any[]) => any>(actionCreator: T) => (...args: Parameters<T>) => ({
        [SHARED]: true,
        ...actionCreator(...args)
    });

export const client =
    <T extends (...args: any[]) => any>(actionCreator: T) => (...args: Parameters<T>) => ({
        [SHARED]: true,
        [CLIENT]: true,
        ...actionCreator(...args)
    });

export const connectToSharedStore =
    (socket: any) => ({
        type: CONNECT,
        payload: {
            socket
        }
    });
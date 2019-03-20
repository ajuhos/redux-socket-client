import { SHARED, CLIENT } from './tags';
import {CONNECT} from "./actions";

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

export const connectToSharedStore =
    (socket: any) => ({
        type: CONNECT,
        payload: {
            socket
        }
    });
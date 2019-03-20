import {CONNECT, PRESENT, SKIP} from './actions'
import { SHARED, CLIENT } from './tags'

export type SharedStoreMiddleware = ((store: any) => (next: Function) => (action: any) => any) & {
    switchSocket(socket: any): void
}

export type SharedStoreMiddlewareOptions = { clientFirst: boolean }

function middleware(): SharedStoreMiddleware;
function middleware(socket: any): SharedStoreMiddleware;
function middleware(socket: any, options: SharedStoreMiddlewareOptions): SharedStoreMiddleware;
function middleware(options: SharedStoreMiddlewareOptions): SharedStoreMiddleware;
function middleware(socket?: any|SharedStoreMiddlewareOptions, options = { clientFirst: false }): SharedStoreMiddleware {
    const setupSockets: ((socket: any) => void)[] = [];
    const autoInit = arguments.length === 2 || (arguments.length === 1 && typeof socket.clientFirst === 'undefined');

    if(!autoInit) {
        options = socket;
        socket = null
    }

    const middleware: SharedStoreMiddleware|any = (store: any) => {
        const SERVER = Symbol('server');
        const queue: any[] = [];
        let version = -100;

        const processAction = (action: any) => {
            action[SERVER] = true;
            store.dispatch(action);
            version++
        };

        const handlePresent = (present: any) => {
            version = -100;
            store.dispatch({
                [SERVER]: true,
                type: PRESENT,
                payload: {state: present.state}
            });
            version = present.version;
            while (queue.length) {
                const {version: next, action} = queue.pop();
                if (next !== version + 1) continue;
                processAction(action)
            }
        };

        const handleVersion = (v: any) => version = v;

        const handleAction = (data: any) => {
            if (data.version !== version + 1) return queue.unshift(data);
            if (data.client) data.action[CLIENT] = data.client;
            processAction(data.action)
        };

        let emit: any = null;
        function setupSocket(newSocket: any) {
            emit = newSocket.emit.bind(newSocket);

            if(newSocket !== socket) {
                socket.removeListener('present', handlePresent);
                socket.removeListener('version', handleVersion);
                socket.removeListener('action', handleAction);
            }

            newSocket.on('present', handlePresent);
            newSocket.on('version', handleVersion);
            newSocket.on('action', handleAction);
            emit('present');
        }

        setupSockets.push(setupSocket);
        if(autoInit) setupSocket(socket);

        return (next: Function) => (action: any) => {
            if(action.type === CONNECT) {
                setupSocket(action.payload.socket)
            }
            else if(emit) {
                if (action[SERVER]) {
                    delete action[SERVER];
                    return next(action)
                }

                if (action[SHARED]) {
                    emit(action[CLIENT] ? 'client-action' : 'action', action);
                    if (options.clientFirst) return next(action);
                    else return next({type: SKIP})
                }
            }

            return next(action)
        }
    };

    middleware.switchSocket = (socket: any) => {
        for(let setupSocket of setupSockets) setupSocket(socket)
    };

    return middleware
}

export const sharedStoreMiddleware = middleware;
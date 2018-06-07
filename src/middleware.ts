import { PRESENT, SKIP } from './actions'
import { SHARED, CLIENT } from './tags'

export const sharedStoreMiddleware = (socket: any, options: { clientFirst: boolean } = { clientFirst: false }) => (store: any) => {
    const processAction = (action: any) => {
        action[SERVER] = true;
        store.dispatch(action);
        version++
    };

    const SERVER = Symbol('server');
    const queue: any[] = [];
    let version = -100;

    socket.on('present', (present: any) => {
        version = -100;
        store.dispatch({
            [SERVER]: true,
            type: PRESENT,
            payload: { state: present.state }
        });
        version = present.version;
        while(queue.length) {
            const { version: next, action } = queue.pop();
            if(next !== version + 1) continue;
            processAction(action)
        }
    });

    socket.on('version', (v: any) => version = v);

    socket.on('action', (data: any) => {
        if(data.version !== version + 1) return queue.unshift(data);
        if(data.client) data.action[CLIENT] = data.client;
        processAction(data.action)
    });

    socket.emit('present');

    return (next: Function) => (action: any) => {
        if(action[SERVER]) {
            delete action[SERVER];
            return next(action)
        }

        if(action[SHARED]) {
            socket.emit(action[CLIENT] ? 'client-action' : 'action', action);
            if(options.clientFirst) return next(action);
            else return next({type: SKIP})
        }

        return next(action)
    }
};
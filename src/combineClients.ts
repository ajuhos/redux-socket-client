import { PRESENT } from './actions';
import { CLIENT } from './tags';
import { Map, fromJS } from 'immutable';

const getClient = (clientId: string, state: Map<string, any>) => state.get(clientId);
const setClient = (clientId: string, client: string, state: Map<string, any>) => state.set(clientId, client);

export const combineClients = (clientReducer: Function) => (state: any, action: any) => {
    if(typeof state === 'undefined') return Map();
    if(action.type === PRESENT) return fromJS(action.payload.state.clients);

    return (state && action && typeof action[CLIENT] !== 'undefined')
        ? setClient(action[CLIENT], clientReducer(getClient(action[CLIENT], state), action), state)
        : state
};
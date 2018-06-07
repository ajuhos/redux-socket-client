import { PRESENT } from './actions';
import { CLIENT } from './tags';

const getClient = (clientId: string, state: any[]) => state.find(c => c.id === clientId);
const setClient = (clientId: string, client: string, state: any[]) => {
    const newState = state.slice();
    newState[state.findIndex(c => c.id === clientId)] = client;
    return newState
};

export const combineClients = (clientReducer: Function) => (state: any[], action: any) => {
    if(typeof state === 'undefined') return [];
    if(action.type === PRESENT) return action.payload.state.clients;

    return (state && action && typeof action[CLIENT] !== 'undefined')
        ? setClient(action[CLIENT], clientReducer(getClient(action[CLIENT], state), action), state)
        : state.map(c => clientReducer(c, state))
};
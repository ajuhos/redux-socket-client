import { ADD_CLIENT, PRESENT } from './actions';
import { CLIENT } from './tags';

type ArrayWithMappings<T> = Array<T> & { mappings: { [key: string]: number } };

const getClient = (clientId: string, state: ArrayWithMappings<any>) => state[state.mappings[clientId]];
const setClient = (clientId: string, client: string, state: ArrayWithMappings<any>): any => {
    const newState = state.slice();
    newState[state.mappings[clientId]] = client;
    return newState
};

export const combineClients = (clientReducer: Function) => (state: ArrayWithMappings<any>|undefined, action: any): any[] => {
    if(typeof state === 'undefined') {
        const newState: any = [];
        newState.mappings = {};
        return newState
    }

    if(action.type === PRESENT) {
        const { clients, shared } = action.payload.state;
        const newState = clients.map(
            (client: any) => clientReducer(client, { type: PRESENT, payload: { state: { shared, client } } })
        );
        newState.mappings = {};
        clients.forEach((client: any, index: number) => newState.mappings[client.id] = index);
        return newState;
    }

    if(action.type === ADD_CLIENT) {
        const newState: any = [ ...state, clientReducer({ id: action[CLIENT] }, action) ];
        newState.mappings = { ...state.mappings, [action[CLIENT]]: newState.length-1 };
        return newState
    }

    const newState: ArrayWithMappings<any> = (state && typeof action[CLIENT] !== 'undefined')
        ? setClient(action[CLIENT], clientReducer(getClient(action[CLIENT], state), action), state)
        : state.map(client => clientReducer(client, action));

    newState.mappings = state.mappings;
    return newState
};
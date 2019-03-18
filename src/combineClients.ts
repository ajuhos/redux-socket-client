import { ADD_CLIENT, PRESENT } from './actions';
import { CLIENT } from './tags';

type ClientSet = {
    items: any[],
    mappings: { [key: string]: number }
};

const getClient = (clientId: string, state: ClientSet) => state.items[state.mappings[clientId]];
const setClient = (clientId: string, client: string, state: ClientSet): any => {
    const items = state.items.slice();
    items[state.mappings[clientId]] = client;
    return {
        items,
        mappings: state.mappings
    }
};

export const combineClients = (clientReducer: Function) => (state: ClientSet|undefined, action: any): ClientSet => {
    if(typeof state === 'undefined') {
        return {
            items: [],
            mappings: {}
        }
    }

    if(action.type === PRESENT) {
        const { clients, shared } = action.payload.state;
        const items = clients.items.map(
            (client: any) => clientReducer(client, { type: PRESENT, payload: { state: { shared, client } } })
        );
        const mappings: any = {};
        items.forEach((client: any, index: number) => mappings[client.id] = index);
        return { items, mappings };
    }

    if(action.type === ADD_CLIENT) {
        const items = [ ...state.items, clientReducer({ id: action[CLIENT] }, action) ];
        return {
            items,
            mappings: { ...state.mappings, [action[CLIENT]]: items.length-1 }
        }
    }

    return (state && typeof action[CLIENT] !== 'undefined')
        ? setClient(action[CLIENT], clientReducer(getClient(action[CLIENT], state), action), state)
        : {
            items: state.items.map(client => clientReducer(client, action)),
            mappings: state.mappings
        }
};
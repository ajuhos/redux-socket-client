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
        return { items, mappings: clients.mappings };
    }

    if(action.type === ADD_CLIENT) {
        if(typeof state.mappings[action[CLIENT]] === "undefined") {
            const items = [...state.items, clientReducer({id: action[CLIENT]}, action)];
            return {
                items,
                mappings: {...state.mappings, [action[CLIENT]]: items.length - 1}
            }
        }
        else {
            // If a client connected at the same time at multiple devices, it is possible
            // to have duplicate ADD_CLIENT actions. Skip in this case.
            return state
        }
    }

    return (state && typeof action[CLIENT] !== 'undefined')
        ? setClient(action[CLIENT], clientReducer(getClient(action[CLIENT], state), action), state)
        : {
            items: state.items.map(client => clientReducer(client, action)),
            mappings: state.mappings
        }
};
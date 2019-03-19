import { CLIENT } from './tags';

export function extractClientId(reducer: (state: any, action: any) => any) {
    return (state: any, action: any) => {
        if(action[CLIENT]) action.meta = { clientId: action[CLIENT] };
        return reducer(state, action)
    }
}
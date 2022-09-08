import { DATA } from "./ActionType";

export const setData = (payload) => {
    return{
        type: DATA,
        payload
    }
}
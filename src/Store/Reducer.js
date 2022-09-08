const initialState = {
    data: []
}

export const Reducer = (state = initialState, {payload, type}) => {

    switch(type){
        case "DATA" :
            return{
                ...state,
                data: payload
            }
        default:
            return state
        }
    }

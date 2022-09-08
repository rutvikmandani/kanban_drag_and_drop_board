import { applyMiddleware, createStore } from "redux";
import RootReducer from "./RootReducer";
import storage from "redux-persist/lib/storage";
import { persistStore, persistReducer } from "redux-persist";

const persistConfi = {
    key:"main-root",
    storage
}

const persistedReducer = persistReducer(persistConfi,RootReducer)

const store = createStore(persistedReducer,applyMiddleware())

const Persistor = persistStore(store)

export {Persistor}
export default store;
import mainReducer from '~/reducers/RootReducer';
import { createStore } from 'redux';
const store = createStore(mainReducer);
export default store;

import cartReducer from '@features/cart';
import wishlistReducer from '@features/wishlist';
import { combineReducers } from 'redux';

const rootReducer = combineReducers({
  cart: cartReducer,
  wishlist: wishlistReducer,
});

export default rootReducer;
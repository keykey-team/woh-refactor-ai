import cartReducer from '@entities/cart';
import wishlistReducer from '@entities/wishlist';
import { combineReducers } from 'redux';

const rootReducer = combineReducers({
  cart: cartReducer,
  wishlist: wishlistReducer,
});

export default rootReducer;
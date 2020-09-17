import {
  CART_REQUEST,
  CART_SUCCESS,
  CART_FAIL,

  CART_CONTENT_SUCCESS,
  CART_CONTENT_SAVE_REQUEST,
  CART_CONTENT_SAVE_SUCCESS,
  CART_CONTENT_SAVE_FAIL,

  ADD_TO_CART_REQUEST,
  ADD_TO_CART_SUCCESS,
  ADD_TO_CART_FAIL,

  CART_CLEAR_REQUEST,
  CART_CLEAR_SUCCESS,
  CART_CLEAR_FAIL,

  CART_RECALCULATE_SUCCESS,

  CART_ADD_COUPON_CODE,
  CART_REMOVE_COUPON_CODE,

  CHANGE_AMOUNT,
  AUTH_LOGOUT,

  RESTORE_STATE,
} from '../constants';

const initialState = {
  amount: 0,
  products: [],
  ids: [],
  fetching: false,
  user_data: {},
  coupons: [],
  vendorCarts: []
};

let newProducts = [];
let newState = null;
let newVendorCarts = [];

export default function (state = initialState, action) {
  switch (action.type) {
    case RESTORE_STATE:
      return {
        ...state,
        ...action.payload.cart,
      };

    case ADD_TO_CART_REQUEST:
      return {
        ...state,
        fetching: true,
      };

    case ADD_TO_CART_SUCCESS:
      return {
        ...state,
        fetching: false,
      };

    case ADD_TO_CART_FAIL:
      return {
        ...state,
        fetching: false,
      };

    case CART_REQUEST:
      return {
        ...state,
        fetching: action.payload.fetching,
      };

    case CART_SUCCESS:
      newVendorCarts = JSON.parse(JSON.stringify(state.vendorCarts));
      if (action.id) {
        newVendorCarts.push(action.payload);
      } else {
        newVendorCarts = [action.payload];
      }

      newState = action.payload;
      Object.keys(newState.payments).forEach((key) => {
        newState.payments[key].payment_id = key;
      });
      return {
        ...state,
        ...newState,
        vendorCarts: newVendorCarts,
        fetching: false,
        coupons: [],
      };

    case CART_FAIL:
      return {
        ...state,
        fetching: false,
      };

    case CART_CLEAR_REQUEST:
      return {
        ...state,
        fetching: true,
      };

    case CART_CLEAR_SUCCESS:
      return {
        ...state,
        amount: 0,
        products: {},
        coupons: [],
        vendorCarts: [],
        fetching: false,
      };

    case CART_CLEAR_FAIL:
      return {
        ...state,
        fetching: false,
      };

    case CART_CONTENT_SUCCESS:
      return {
        ...state,
        user_data: action.payload.user_data,
        fetching: false,
      };

    case CART_CONTENT_SAVE_REQUEST:
    case CART_CONTENT_SAVE_FAIL:
      return {
        ...state,
        fetching: true,
      };

    case CART_CONTENT_SAVE_SUCCESS:
      return {
        ...state,
        user_data: {
          ...state.user_data,
          ...action.payload,
        },
        fetching: false,
      };

    case CART_RECALCULATE_SUCCESS:
      return {
        ...state,
        total: action.payload.total,
        total_formatted: action.payload.total_formatted,
        subtotal: action.payload.total_formatted,
        subtotal_formatted: action.payload.subtotal_formatted,
        coupons: Object.keys(action.payload.coupons).map(k => k),
      };

    case AUTH_LOGOUT:
      return initialState;

    case CHANGE_AMOUNT:
      newProducts = { ...state.products };
      newProducts[action.payload.cid].amount = action.payload.amount;
      return {
        ...state,
        products: newProducts,
      };

    case CART_ADD_COUPON_CODE:
      return {
        ...state,
        coupons: [
          ...state.coupons,
          action.payload,
        ],
      };

    case CART_REMOVE_COUPON_CODE:
      return {
        ...state,
        coupons: [...state.coupons].filter(item => item !== action.payload),
      };

    default:
      return state;
  }
}

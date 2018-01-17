import {
  FETCH_PRODUCTS_REQUEST,
  FETCH_PRODUCTS_FAIL,
  FETCH_PRODUCTS_SUCCESS,

  SEARCH_PRODUCTS_REQUEST,
  SEARCH_PRODUCTS_FAIL,
  SEARCH_PRODUCTS_SUCCESS,

  FETCH_ONE_PRODUCT_REQUEST,
  FETCH_ONE_PRODUCT_FAIL,
  FETCH_ONE_PRODUCT_SUCCESS,

  FETCH_PRODUCT_OPTIONS_REQUEST,
  FETCH_PRODUCT_OPTIONS_FAIL,
  FETCH_PRODUCT_OPTIONS_SUCCESS,

  FETCH_DISCUSSION_REQUEST,
  FETCH_DISCUSSION_SUCCESS,
  FETCH_DISCUSSION_FAIL,
} from '../constants';
import Api from '../services/api';

export function fetchDiscussion(pid, params = { page: 1 }) {
  return (dispatch) => {
    dispatch({
      type: FETCH_DISCUSSION_REQUEST,
    });

    return Api.get(`/sra_discussion/?object_type=P&object_id=${pid}&params[page]=${params.page}`)
      .then((response) => {
        dispatch({
          type: FETCH_DISCUSSION_SUCCESS,
          payload: {
            discussion: response.data,
            page: params.page,
          },
        });
      })
      .catch((error) => {
        dispatch({
          type: FETCH_DISCUSSION_FAIL,
          error,
        });
      });
  };
}

export function fetchOptions(pid) {
  return (dispatch) => {
    dispatch({ type: FETCH_PRODUCT_OPTIONS_REQUEST });
    return Api.get(`/options/?product_id=${pid}`)
      .then((response) => {
        dispatch({
          type: FETCH_PRODUCT_OPTIONS_SUCCESS,
          payload: {
            options: response.data,
          },
        });
      })
      .catch((error) => {
        dispatch({
          type: FETCH_PRODUCT_OPTIONS_FAIL,
          error
        });
      });
  };
}

export function fetch(pid) {
  return (dispatch) => {
    dispatch({ type: FETCH_ONE_PRODUCT_REQUEST });
    return Api.get(`/sra_products/${pid}`)
      .then((response) => {
        dispatch({
          type: FETCH_ONE_PRODUCT_SUCCESS,
          payload: {
            product: response.data,
          },
        });
        // get options.
        setTimeout(() => fetchOptions(pid)(dispatch), 100);
        // get discussion
        setTimeout(() => fetchDiscussion(pid)(dispatch), 100);
      })
      .catch((error) => {
        dispatch({
          type: FETCH_ONE_PRODUCT_FAIL,
          error
        });
      });
  };
}

export function search(params = {}) {
  return (dispatch) => {
    dispatch({ type: SEARCH_PRODUCTS_REQUEST });

    return Api.get('/sra_products', {
      params: {
        ...params,
      }
    })
      .then((response) => {
        dispatch({
          type: SEARCH_PRODUCTS_SUCCESS,
          payload: response.data,
        });
      })
      .catch((error) => {
        dispatch({
          type: SEARCH_PRODUCTS_FAIL,
          error
        });
      });
  };
}

export function fetchByCategory(categoryId, page = 1) {
  return (dispatch) => {
    dispatch({ type: FETCH_PRODUCTS_REQUEST });
    return Api.get(`/categories/${categoryId}/sra_products?items_per_page=10&page=${page}&subcats=Y`)
      .then((response) => {
        dispatch({
          type: FETCH_PRODUCTS_SUCCESS,
          payload: response.data,
        });
      })
      .catch((error) => {
        dispatch({
          type: FETCH_PRODUCTS_FAIL,
          error
        });
      });
  };
}

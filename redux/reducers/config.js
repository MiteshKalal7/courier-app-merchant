import {THEME_SET, INIT} from '../actions/config';

const defaultState = {
  theme: 'default',
  brand: {
    backgroundColor: '#036d05',
    color: '#fff',
    currency: '৳',
  },
  profileStatus: {},
};
function config(state = defaultState, action) {
  switch (action.type) {
    case THEME_SET:
      return {...state, theme: action.payload};
    case INIT:
      console.log(action.payload[1][1]);
      return {
        ...state,
        theme: action.payload[0][1],
        brand: action.payload[1][1],
        profileStatus: action.payload[2][1],
      };

    case 'UPDATE_STATUS':
      return {
        ...state,
        profileStatus: action.payload,
      };
    default:
      return state;
  }
}

export default config;

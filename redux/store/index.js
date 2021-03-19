import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import configureStore from './../reducers/config';
import AsyncStorage from '@react-native-community/async-storage';
import {setInit} from './../actions/config';

export const getAsyncStorage = () => {
  return (dispatch) => {
    AsyncStorage.multiGet(['themeMode', 'themeColor', 'profileStatus']).then(
      (result) => {
        if (result !== null) {
          // console.log('##########  #####################################');
          // console.log(result);
          dispatch(setInit(result));
        } else {
          dispatch(setInit('default'));
        }
      },
    );
  };
};

export const store = createStore(configureStore, applyMiddleware(thunk));

store.dispatch(getAsyncStorage());

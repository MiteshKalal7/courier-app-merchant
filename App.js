import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import DrawerContent from './screens/common/DrawerContent';

import Registration from './screens/authentication/Registration';
import Login from './screens/authentication/Login';
import Dashboard from './screens/user/Dashboard';
import Notifications from './screens/user/Notifications';
import ProfileStep from './screens/user';
import Shipment from './screens/user/shipment';
// import SplashScreen from 'react-native-splash-screen';

// import {LogBox} from 'react-native';
import {Provider} from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import {store, getAsyncStorage} from './redux/store';
// import messaging from '@react-native-firebase/messaging';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// LogBox.ignoreLogs(['Warning: ...']);
// console.ignoredYellowBox = ['Warning: Each', 'Warning: Failed'];
console.disableYellowBox = true;

function User() {
  const [userInfo, setUserInfo] = React.useState('');

  React.useEffect(() => {
    getUserInfo();
  }, []);

  const getUserInfo = async () => {
    let userInfo = await AsyncStorage.getItem('userInfo');
    if (userInfo) {
      store.dispatch(getAsyncStorage());

      userInfo = JSON.parse(userInfo);
      setUserInfo(userInfo);
    }
  };

  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <DrawerContent {...props} size="22" data={userInfo} />
      )}>
      <Drawer.Screen name="Dashboard" component={Dashboard} />
      <Drawer.Screen name="ProfileStep" component={ProfileStep} />
      <Drawer.Screen name="Shipment" component={Shipment} />
      <Drawer.Screen name="Notifications" component={Notifications} />
    </Drawer.Navigator>
  );
}

function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Registration" component={Registration} />
          <Stack.Screen name="User" component={User} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

export default App;

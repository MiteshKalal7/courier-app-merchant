import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import LOGO from './../../assets/logo.png';
import {Snackbar, TextInput} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {API_URL} from '../../global/config';
import {getThemeColors} from '../../global/themes';
import Ripple from 'react-native-material-ripple';
import {globalStyles} from '../../global/styles';
import AsyncStorage from '@react-native-community/async-storage';
import SplashScreen from 'react-native-splash-screen';
import {connect} from 'react-redux';
import {setTheme} from '../../redux/actions/config';
// import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';
import {store, getAsyncStorage} from './../../redux/store';

class Login extends React.Component {
  state = {
    username: '',
    password: '',
    message: '',
    visible: false,
    success: false,
    deviceName: '',
  };

  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.checkUserIsLoggedIn();
    DeviceInfo.getDeviceName().then((deviceName) => {
      this.setState({deviceName});
    });
  }

  checkUserIsLoggedIn = async () => {
    let userInfo = await AsyncStorage.getItem('userInfo');
    if (userInfo) {
      //
      store.dispatch(getAsyncStorage());

      // Check whether an initial notification is available
      messaging()
        .getInitialNotification()
        .then((remoteMessage) => {
          // alert(JSON.stringify(remoteMessage));
          // console.log(remoteMessage);
          if (remoteMessage !== null) {
            return this.props.navigation.navigate('Notifications');
          }
        });

      this.props.navigation.replace('User');
    } else {
      SplashScreen.hide();
    }
  };

  showSnackbar = (message, status = false) => {
    this.setState({
      visible: true,
      success: status,
      message: message,
    });
  };

  getThemeMode = (id) => {
    fetch(`${API_URL}getDarkMode`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: id,
      }),
    })
      .then((res) => res.json())
      .then((response) => {
        this.setState({loading: false});
        if (response.status) {
          let value = response.darkMode ? 'dark' : 'default';
          AsyncStorage.setItem('themeMode', value);
          this.props.setUserTheme(value);
        }
      })
      .catch((err) => {
        this.setState({loading: false});
        console.log(err);
      });
  };

  // getUserStatus = (id) => {
  //   fetch(`${API_URL}merchantProfileCompeletionAction`, {
  //     method: 'POST',
  //     headers: {
  //       Accept: 'application/json',
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       merchant_id: id,
  //     }),
  //   })
  //     .then((res) => res.json())
  //     .then((response) => {
  //       // if (response.status) {
  //       // alert(JSON.stringify(response));
  //       // let value = response.darkMode ? 'dark' : 'default';
  //       AsyncStorage.setItem('profileStatus', JSON.stringify(response));
  //       // this.props.setUserTheme(value);
  //       // }
  //     })
  //     .catch((err) => {
  //       this.setState({loading: false});
  //       console.log(err);
  //     });
  // };

  getBrandColor = () => {
    fetch(`${API_URL}brand`)
      .then((res) => res.json())
      .then((response) => {
        if (response.status) {
          let object = response;
          // object.currency = response.currency;
          object = JSON.stringify(object);
          AsyncStorage.setItem('themeColor', object);
          store.dispatch(getAsyncStorage());
        }
      })
      .catch((err) => {
        this.setState({loading: false});
        console.log(err);
      });
  };

  storeDeviceInfo = (id) => {
    let brand = DeviceInfo.getBrand();
    let uniqueId = DeviceInfo.getUniqueId();
    let getModel = DeviceInfo.getModel();
    let getSystemVersion = DeviceInfo.getSystemVersion();
    let name = DeviceInfo.getSystemName();

    messaging()
      .getToken()
      .then((token) => {
        let requestData = JSON.stringify({
          user_id: id,
          device_uid: uniqueId,
          device_token: token,
          device_name: this.state.deviceName,
          device_model: getModel,
          manufacturer: brand,
          device_version: getSystemVersion,
          device_type: name,
          other_info: '123',
        });

        fetch(`${API_URL}addUserDevice`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: requestData,
        })
          .then((res) => res.json())
          .then((response) => {
            let status = response.status;
            if (!status) {
              this.showSnackbar(response.status_text);
            }
          })
          .catch((err) => {
            console.log(err);
            this.setState({loading: false});
          });
      });

    // messaging().onNotificationOpenedApp((remoteMessage) => {
    //   console.log(
    //     'Notification caused app to open from background state:',
    //     remoteMessage,
    //   );
    // });

    // Check whether an insitial notification is available
    // messaging()
    //   .getInitialNotification()
    //   .then((remoteMessage) => {
    //     console.log(
    //       'Notification caused app to open from quit state:',
    //       remoteMessage,
    //     );
    //   });
  };

  render() {
    const login = () => {
      Keyboard.dismiss();
      if (this.state.username === '') {
        this.showSnackbar('Username is required');
      } else if (this.state.password === '') {
        this.showSnackbar('Password is required');
      } else {
        let requestData = JSON.stringify({
          username: this.state.username,
          password: this.state.password,
        });
        this.setState({loading: true});
        console.log(`${API_URL}login` + requestData);
        fetch(`${API_URL}login`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: requestData,
        })
          .then((res) => res.json())
          .then((response) => {
            // console.log(response.user_arr);

            let status = response.status;

            if (status) {
              AsyncStorage.setItem(
                'userInfo',
                JSON.stringify(response.user_arr),
              );
              this.getThemeMode(response.user_arr.id);
              this.storeDeviceInfo(response.user_arr.id);
              this.getBrandColor();
              // this.getUserStatus(response.user_arr.id);
              this.props.navigation.replace('User');
            } else {
              this.setState({loading: false});
              this.showSnackbar(response.status_text);
            }
          })
          .catch((err) => {
            console.log(err);
            this.setState({loading: false});
          });
      }
    };

    const {colors} = this.props;

    const inputTheme = {
      colors: {
        primary: colors.primaryColor,
        placeholder: colors.textLight,
        text: colors.textColor,
      },
    };

    return (
      <>
        <ScrollView
          style={styles.container(colors.secondaryColor)}
          keyboardShouldPersistTaps="always">
          <View
            style={{
              paddingHorizontal: 10,
            }}>
            <View
              style={{
                height: Dimensions.get('window').height / 3.5,
                justifyContent: 'center',
              }}>
              <Image
                source={LOGO}
                style={{
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              />
            </View>
            <View style={{justifyContent: 'center'}}>
              <TextInput
                label="Username"
                value={this.state.username}
                onChangeText={(username) => {
                  this.setState({username});
                }}
                style={globalStyles.inputStyle}
                right={
                  <TextInput.Icon
                    name={() => (
                      <Icon
                        name={'account'}
                        size={20}
                        color={colors.textLight}
                      />
                    )}
                  />
                }
                theme={inputTheme}
              />
              <TextInput
                label="Password"
                value={this.state.password}
                onChangeText={(password) => {
                  this.setState({password});
                }}
                style={globalStyles.inputStyle}
                // keyboardType={'visible-password'}
                secureTextEntry={this.state.showPassword ? false : true}
                right={
                  <TextInput.Icon
                    onPress={() =>
                      this.setState({showPassword: !this.state.showPassword})
                    }
                    name={() => (
                      <Icon
                        name={this.state.showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color={colors.textLight}
                      />
                    )}
                  />
                }
                theme={inputTheme}
              />

              <Ripple
                style={globalStyles.buttonStyle(colors.primaryColor)}
                disabled={this.state.loading ? true : false}
                onPress={() => login()}>
                {this.state.loading ? (
                  <ActivityIndicator color="#fff" size={26} />
                ) : (
                  <Text style={{color: colors.primaryTextColor, fontSize: 20}}>
                    Login
                  </Text>
                )}
              </Ripple>
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 10,
                  marginHorizontal: 10,
                }}>
                <TouchableOpacity onPress={() => console.log('om')}>
                  <Text style={{color: colors.textLight}}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{marginLeft: 'auto'}}
                  onPress={() =>
                    this.props.navigation.navigate('Registration')
                  }>
                  <Text style={{color: colors.textLight}}>Sign up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        <Snackbar
          visible={this.state.visible}
          duration={2000}
          onDismiss={() => {
            this.setState({
              visible: false,
            });
          }}
          style={
            this.state.success
              ? {backgroundColor: colors.alertSuccess}
              : {backgroundColor: colors.alertDanger}
          }>
          {this.state.message}
        </Snackbar>
        {/* {this.state.loading ? <Loader /> : null} */}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  var theme = getThemeColors(state.theme);
  return {colors: theme, theme: state.theme};
};

export default connect(mapStateToProps, {
  setUserTheme: setTheme,
})(Login);

const styles = StyleSheet.create({
  container: (bgColor) => ({
    flex: 1,
    backgroundColor: bgColor,
  }),
});

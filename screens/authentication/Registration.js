import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Keyboard,
} from 'react-native';
import LOGO from './../../assets/logo.png';
import {Snackbar, TextInput} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {API_URL} from '../../global/config';
// import {colors} from '../../global/themes';
import Ripple from 'react-native-material-ripple';

import {globalStyles} from '../../global/styles';
import AsyncStorage from '@react-native-community/async-storage';
import {getThemeColors} from '../../global/themes';
import {connect} from 'react-redux';
import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';
import {store, getAsyncStorage} from './../../redux/store';

class Registration extends React.Component {
  state = {
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    address: '',
    message: '',
    visible: false,
    success: false,
  };

  constructor(props) {
    super(props);
    DeviceInfo.getDeviceName().then((deviceName) => {
      this.setState({deviceName});
    });
  }

  showSnackbar = (message, status = false) => {
    this.setState({
      visible: true,
      success: status,
      message: message,
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
  };

  getBrandColor = () => {
    fetch(`${API_URL}brand`)
      .then((res) => res.json())
      .then((response) => {
        if (response.status) {
          let object = response.brand;
          object.currency = response.currency;
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

  render() {
    const registration = () => {
      Keyboard.dismiss();
      let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

      if (this.state.fullName === '') {
        this.showSnackbar('Full name is required');
      } else if (this.state.email === '') {
        this.showSnackbar('Email is required');
      } else if (reg.test(this.state.email) === false) {
        this.showSnackbar('Email is invalid');
      } else if (this.state.username === '') {
        this.showSnackbar('Username is required');
      } else if (this.state.password === '') {
        this.showSnackbar('Password is required');
      } else if (this.state.confirmPassword === '') {
        this.showSnackbar('Confirm password is required');
      } else if (this.state.confirmPassword !== this.state.password) {
        this.showSnackbar('Password and Confirm password mush be same');
      } else if (this.state.address === '') {
        this.showSnackbar('Address filed is required');
      } else {
        let requestData = JSON.stringify({
          email: this.state.email,
          name: this.state.fullName,
          username: this.state.username,
          password: this.state.password,
          password_confirmation: this.state.confirmPassword,
          address: this.state.address,
        });
        this.setState({loading: true});
        console.log(`${API_URL}merchantSignup` + requestData);
        fetch(`${API_URL}merchantSignup`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: requestData,
        })
          .then((res) => res.json())
          .then((response) => {
            console.log(response);

            this.setState({loading: false});

            let status = response.status;

            if (status) {
              AsyncStorage.setItem('userInfo', JSON.stringify(response.user));
              this.storeDeviceInfo(response.user.id);
              this.getBrandColor();
              this.props.navigation.replace('User');
            } else {
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
          <View style={{paddingHorizontal: 10, justifyContent: 'center'}}>
            <View
              style={{
                height: 140,
                justifyContent: 'center',
              }}>
              <Image
                source={LOGO}
                style={{marginLeft: 'auto', marginRight: 'auto'}}
              />
            </View>

            <TextInput
              label="Full Name"
              value={this.state.fullName}
              onChangeText={(text) => this.setState({fullName: text})}
              style={globalStyles.inputStyle}
              right={
                <TextInput.Icon
                  name={() => (
                    <Icon name={'account'} size={20} color={colors.textLight} />
                  )}
                />
              }
              theme={inputTheme}
            />
            <TextInput
              label="Email"
              value={this.state.email}
              onChangeText={(email) => {
                this.setState({email});
              }}
              keyboardType={'email-address'}
              style={globalStyles.inputStyle}
              right={
                <TextInput.Icon
                  name={() => (
                    <Icon name={'email'} size={20} color={colors.textLight} />
                  )}
                />
              }
              theme={inputTheme}
            />
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
                    <Icon name={'account'} size={20} color={colors.textLight} />
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
            <TextInput
              label="Confirm Password"
              value={this.state.confirmPassword}
              onChangeText={(confirmPassword) => {
                this.setState({confirmPassword});
              }}
              style={globalStyles.inputStyle}
              secureTextEntry={this.state.showConfirmPassword ? false : true}
              right={
                <TextInput.Icon
                  onPress={() =>
                    this.setState({
                      showConfirmPassword: !this.state.showConfirmPassword,
                    })
                  }
                  name={() => (
                    <Icon
                      name={this.state.showConfirmPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={colors.textLight}
                    />
                  )}
                />
              }
              theme={inputTheme}
            />
            <TextInput
              label="Address"
              value={this.state.address}
              onChangeText={(address) => {
                this.setState({address});
              }}
              style={globalStyles.inputStyle}
              multiline={true}
              right={
                <TextInput.Icon
                  name={() => (
                    <Icon name={'home'} size={20} color={colors.textLight} />
                  )}
                />
              }
              theme={inputTheme}
            />

            <Ripple
              style={globalStyles.buttonStyle(colors.primaryColor)}
              disabled={this.state.loading ? true : false}
              onPress={() => registration()}>
              {this.state.loading ? (
                <ActivityIndicator color="#fff" size={26} />
              ) : (
                <Text style={{color: colors.primaryTextColor, fontSize: 20}}>
                  Register
                </Text>
              )}
            </Ripple>
            <View
              style={{flexDirection: 'row', marginTop: 10, marginBottom: 30}}>
              <TouchableOpacity
                style={{marginLeft: 'auto'}}
                onPress={() => this.props.navigation.navigate('Login')}>
                <Text style={{color: colors.textLight}}>Back to Login</Text>
              </TouchableOpacity>
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
  return {colors: theme};
};

export default connect(mapStateToProps)(Registration);

const styles = StyleSheet.create({
  container: (bgColor) => ({
    flex: 1,
    backgroundColor: bgColor,
  }),
});

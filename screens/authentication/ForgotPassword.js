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
import {connect} from 'react-redux';
import {setTheme} from '../../redux/actions/config';

class Login extends React.Component {
  state = {
    email: '',
    message: '',
    visible: false,
    success: false,
  };

  constructor(props) {
    super(props);
  }
  // async componentDidMount() {
  //   let userEmail = await AsyncStorage.getItem('emailAddress');
  //   alert(userEmail);
  // }

  showSnackbar = (message, status = false) => {
    this.setState({
      visible: true,
      success: status,
      message: message,
    });
  };

  render() {
    const sendVerificationCode = () => {
      Keyboard.dismiss();
      let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

      if (this.state.email === '') {
        this.showSnackbar('email is required');
      } else if (reg.test(this.state.email) === false) {
        this.showSnackbar('Email is invalid');
      } else {
        let requestData = JSON.stringify({
          email: this.state.email,
        });
        this.setState({loading: true});
        console.log(`${API_URL}sendOTPforPasswordRecovery` + requestData);
        fetch(`${API_URL}sendOTPforPasswordRecovery`, {
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
              AsyncStorage.setItem('emailAddress', this.state.email);
              this.setState({
                email: '',
              });
            }

            this.setState({loading: false});
            this.showSnackbar(response.data, status);

            // if (status) {
            //   alert('true');
            //   // this.getUserStatus(response.user_arr.id);
            //   //   this.props.navigation.replace('User');
            // } else {
            // }
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
                label="Enter your email"
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

              <Ripple
                style={globalStyles.buttonStyle(colors.primaryColor)}
                disabled={this.state.loading ? true : false}
                onPress={() => sendVerificationCode()}>
                {this.state.loading ? (
                  <ActivityIndicator color="#fff" size={26} />
                ) : (
                  <Text style={{color: colors.primaryTextColor, fontSize: 20}}>
                    Send Reset code
                  </Text>
                )}
              </Ripple>
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 10,
                  marginHorizontal: 10,
                }}>
                <TouchableOpacity
                  onPress={() =>
                    this.props.navigation.navigate('ChangePassword')
                  }>
                  <Text style={{color: colors.textLight}}>I have code</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{marginLeft: 'auto'}}
                  onPress={() => this.props.navigation.navigate('Login')}>
                  <Text style={{color: colors.textLight}}>Back to Login</Text>
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

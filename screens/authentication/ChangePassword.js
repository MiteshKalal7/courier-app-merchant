import {
  ActivityIndicator,
  Animated,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Keyboard,
} from 'react-native';
import React, {useState} from 'react';
import {StyleSheet, Platform} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import {globalStyles} from '../../global/styles';
import Ripple from 'react-native-material-ripple';
import LOGO from './../../assets/logo.png';

import LOCK_IMAGE from './../../assets/lock.png';
import {API_URL} from '../../global/config';
import {getThemeColors} from '../../global/themes';
import {connect} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {Snackbar, TextInput} from 'react-native-paper';
import AsyncStorage from '@react-native-community/async-storage';
const {Value, Text: AnimatedText} = Animated;

const CELL_COUNT = 4;
const CELL_SIZE = 50;
const CELL_BORDER_RADIUS = 8;
const animationsColor = [...new Array(CELL_COUNT)].map(() => new Value(0));
const animationsScale = [...new Array(CELL_COUNT)].map(() => new Value(1));
const animateCell = ({hasValue, index, isFocused}) => {
  Animated.parallel([
    Animated.timing(animationsColor[index], {
      useNativeDriver: false,
      toValue: isFocused ? 1 : 0,
      duration: 250,
    }),
    Animated.spring(animationsScale[index], {
      useNativeDriver: false,
      toValue: hasValue ? 0 : 1,
      duration: hasValue ? 300 : 250,
    }),
  ]).start();
};

const ChangePassword = (props_) => {
  const navigation = useNavigation();

  const [value, setValue] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sendSuccess, setSendSuccess] = useState(false);
  const [verified, setVerified] = useState(false);
  const [visible, setVisible] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  const {colors} = props_;
  const inputTheme = {
    colors: {
      primary: colors.primaryColor,
      placeholder: colors.textLight,
      text: colors.textColor,
    },
  };
  const [borderColor, setBorderColor] = useState(colors.backgroundColor);

  const DEFAULT_CELL_BG_COLOR = colors.cardColor;
  const NOT_EMPTY_CELL_BG_COLOR = colors.primaryColor;
  const ACTIVE_CELL_BG_COLOR = colors.borderColor;

  const renderCell = ({index, symbol, isFocused}) => {
    const hasValue = Boolean(symbol);
    const animatedCellStyle = {
      backgroundColor: hasValue
        ? animationsScale[index].interpolate({
            inputRange: [0, 1],
            outputRange: [NOT_EMPTY_CELL_BG_COLOR, ACTIVE_CELL_BG_COLOR],
          })
        : animationsColor[index].interpolate({
            inputRange: [0, 1],
            outputRange: [DEFAULT_CELL_BG_COLOR, ACTIVE_CELL_BG_COLOR],
          }),
      borderRadius: animationsScale[index].interpolate({
        inputRange: [0, 1],
        outputRange: [CELL_SIZE, CELL_BORDER_RADIUS],
      }),
      borderColor: borderColor,
      borderWidth: 1,
      transform: [
        {
          scale: animationsScale[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0.2, 1],
          }),
        },
      ],
    };

    // Run animation on next event loop tik
    // Because we need first return new style prop and then animate this value
    setTimeout(() => {
      animateCell({hasValue, index, isFocused});
    }, 0);

    return (
      <AnimatedText
        key={index}
        style={[styles.cell(colors.primaryColor), animatedCellStyle]}
        onLayout={getCellOnLayoutHandler(index)}>
        {symbol || (isFocused ? <Cursor /> : null)}
      </AnimatedText>
    );
  };

  const showSnackbar = (message, status = false) => {
    // this.setState({
    //   visible: true,
    //   success: status,
    //   message: message,
    // });
    setVisible(true);
    setSuccess(status);
    setMessage(message);
  };

  const onPasswordChanged = async () => {
    if (password === '') {
      showSnackbar('New Password is required!');
    } else if (confirmPassword === '') {
      showSnackbar('Confirm Password is required!');
    } else if (confirmPassword !== password) {
      showSnackbar('New Password and Confirm Password must be same!');
    } else {
      Keyboard.dismiss();
      let userEmail = await AsyncStorage.getItem('emailAddress');
      // alert(userEmail);
      setVerifying(true);
      console.log(
        `${API_URL}resetPassword`,
        JSON.stringify({
          email: userEmail,
          password: password,
        }),
      );
      fetch(`${API_URL}resetPassword`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          password: password,
        }),
      })
        .then((res) => res.json())
        .then((response) => {
          let status = response.status;
          showSnackbar(response.status_text, status);

          if (response.status) {
            // navigation.replace('Login', {
            //   screen: 'ChangePassword',
            //   message: response.status_text,
            // });
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'Login',
                  params: {
                    screen: 'ChangePassword',
                    message: response.status_text,
                  },
                },
              ],
            });
          }
        })
        .catch((err) => {
          console.log(err);
          setVerifying(false);
        });
    }
  };
  const onVerifying = async () => {
    let userEmail = await AsyncStorage.getItem('emailAddress');
    // alert(userEmail);
    setVerifying(true);
    console.log(
      `${API_URL}verifyPasswordOTP`,
      JSON.stringify({
        email: userEmail,
        otp: value,
      }),
    );
    fetch(`${API_URL}verifyPasswordOTP`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userEmail,
        otp: value,
      }),
    })
      .then((res) => res.json())
      .then((response) => {
        console.log(response);
        setVerifying(false);

        // response.status = true;

        let status = response.status;
        showSnackbar(response.data, status);
        setValue('');

        if (response.status) {
          setVerified(true);
        } else {
          setBorderColor(colors.alertDanger);
        }
      })
      .catch((err) => {
        console.log(err);
        setVerifying(false);
      });
  };

  return (
    <>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.secondaryColor,
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
        {verified ? (
          <>
            <TextInput
              label="New Password"
              value={password}
              onChangeText={(password) => {
                setPassword(password);
              }}
              style={globalStyles.inputStyle}
              // keyboardType={'visible-password'}
              secureTextEntry={showPassword ? false : true}
              right={
                <TextInput.Icon
                  onPress={() => setShowPassword(!showPassword)}
                  name={() => (
                    <Icon
                      name={showPassword ? 'eye-off' : 'eye'}
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
              value={confirmPassword}
              onChangeText={(password) => {
                setConfirmPassword(password);
              }}
              style={globalStyles.inputStyle}
              // keyboardType={'visible-password'}
              secureTextEntry={showConfirmPassword ? false : true}
              right={
                <TextInput.Icon
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  name={() => (
                    <Icon
                      name={showConfirmPassword ? 'eye-off' : 'eye'}
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
              onPress={onPasswordChanged}>
              {verifying ? (
                <ActivityIndicator color="#fff" size={26} />
              ) : (
                <Text style={{color: colors.primaryTextColor, fontSize: 20}}>
                  Change Password
                </Text>
              )}
            </Ripple>
          </>
        ) : (
          <>
            <Image style={styles.icon} source={LOCK_IMAGE} />
            <Text style={styles.subTitle(colors.textLight)}>
              Please enter the verification code
            </Text>
            <CodeField
              ref={ref}
              {...props}
              value={value}
              onChangeText={setValue}
              cellCount={CELL_COUNT}
              rootStyle={styles.codeFieldRoot}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              renderCell={renderCell}
            />
            <Ripple
              style={globalStyles.buttonStyle(colors.primaryColor)}
              disabled={verifying || value.length !== 4 ? true : false}
              onPress={onVerifying}>
              {verifying ? (
                <ActivityIndicator color="#fff" size={26} />
              ) : (
                <Text style={{color: colors.primaryTextColor, fontSize: 20}}>
                  Verify
                </Text>
              )}
            </Ripple>
          </>
        )}
        <View style={{marginBottom: 20}}>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 10,
              marginHorizontal: 10,
            }}>
            <TouchableOpacity
              style={{marginLeft: 'auto'}}
              onPress={() => navigation.navigate('Login')}>
              <Text style={{color: colors.textLight}}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Snackbar
        visible={visible}
        duration={2000}
        onDismiss={() => {
          setVisible(false);
        }}
        style={
          success
            ? {backgroundColor: colors.alertSuccess}
            : {backgroundColor: colors.alertDanger}
        }>
        {message}
      </Snackbar>
    </>
  );
};

// export default ChangePassword;
const mapStateToProps = (state) => {
  var theme = getThemeColors(state.theme);
  return {colors: theme, theme: state.theme};
};

export default connect(mapStateToProps)(ChangePassword);

const styles = StyleSheet.create({
  codeFieldRoot: {
    height: CELL_SIZE,
    marginTop: 30,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  cell: (color) => ({
    marginHorizontal: 8,
    height: CELL_SIZE,
    width: CELL_SIZE,
    lineHeight: CELL_SIZE - 5,
    ...Platform.select({web: {lineHeight: 65}}),
    fontSize: 30,
    textAlign: 'center',
    borderRadius: CELL_BORDER_RADIUS,
    color: color,

    // IOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    // Android
    elevation: 3,
  }),

  // =======================

  title: (color) => ({
    paddingVertical: 10,
    color: color,
    fontSize: 25,
    fontWeight: '700',
    textAlignVertical: 'center',
    paddingLeft: 10,
  }),
  icon: {
    marginTop: 15,
    width: 217 / 2.4,
    height: 158 / 2.4,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  subTitle: (color) => ({
    paddingTop: 30,
    color: color,
    textAlign: 'center',
  }),
});

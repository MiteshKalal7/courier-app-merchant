import {
  ActivityIndicator,
  Animated,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
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

import LOCK_IMAGE from './../../assets/lock.png';
import Modal from 'react-native-modal';
import {Divider, TouchableRipple} from 'react-native-paper';
import {API_URL} from '../../global/config';
import LottieView from 'lottie-react-native';
import SUCCESS from './success.json';
import {color} from 'react-native-reanimated';

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

const InputOPT = (props_) => {
  const [value, setValue] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sending, setSending] = useState(false);
  const [displayAnimation, setDisplayAnimation] = useState(false);
  const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  const {colors} = props_;
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

  React.useEffect(() => {
    setValue('');
    setVerifying(false);
    setBorderColor(colors.backgroundColor);
    setSendSuccess(false);
    setSending(false);
    setDisplayAnimation(false);
  }, [props_.orderId]);

  const onVerifying = () => {
    // alert(value.length);
    setVerifying(true);
    console.log(
      `${API_URL}verifyCustomerAndSetAsDelivered`,
      JSON.stringify({
        user_id: props_.userId,
        order_id: props_.orderId,
        code: value,
      }),
    );
    fetch(`${API_URL}verifyCustomerAndSetAsDelivered`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: props_.userId,
        order_id: props_.orderId,
        code: value,
      }),
    })
      .then((res) => res.json())
      .then((response) => {
        console.log(response);
        setVerifying(false);

        // response.status = true;

        if (response.status) {
          // console.log('success');
          setValue('');
          props_.changeStatusSuccess(props_.orderId);
          props_.onClosePress();
        } else {
          setValue('');
          setBorderColor(colors.alertDanger);
          //   alert('otp is is correct!!');
        }
      })
      .catch((err) => {
        console.log(err);
        setVerifying(false);
      });
  };

  const sendOTPCode = () => {
    setSending(true);
    // alert('sended' + props_.orderId);

    // setTimeout(() => {
    //   setSending(false);
    //   setSendSuccess(true);
    //   setDisplayAnimation(true);
    //   setTimeout(() => {
    //     setDisplayAnimation(false);
    //   }, 5000);
    // }, 2000);

    console.log(
      `${API_URL}sendOTPforDelivery`,
      JSON.stringify({order_id: props_.orderId}),
    );
    fetch(`${API_URL}sendOTPforDelivery`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({order_id: props_.orderId}),
    })
      .then((res) => res.json())
      .then((response) => {
        console.log(response);

        if (response.status) {
          setSending(false);
          setSendSuccess(true);
          setDisplayAnimation(true);

          setTimeout(() => {
            setDisplayAnimation(false);
          }, 5000);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <Modal isVisible={props_.visible}>
      <View
        style={{
          // flex: 1,
          backgroundColor: colors.secondaryColor,
          borderRadius: 20,
          justifyContent: 'center',
        }}>
        <View style={{flexDirection: 'row'}}>
          <Text style={styles.title(colors.textColor)}>Verification</Text>
          <TouchableRipple
            onPress={() => {
              setBorderColor(colors.backgroundColor);
              props_.onClosePress();
            }}
            borderless={true}
            centered={true}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              width: 30 * 1.5,
              height: 30 * 1.5,
              borderRadius: (30 * 1.5) / 2,
              marginLeft: 'auto',
              marginVertical: 5,
              marginRight: 5,
            }}
            rippleColor="rgba(0, 0, 0, .32)">
            <Icon size={30} name="close" color={colors.alertDanger} />
          </TouchableRipple>
        </View>
        <Divider />
        <Image style={styles.icon} source={LOCK_IMAGE} />
        <Text style={styles.subTitle(colors.textLight)}>
          Please enter the verification code{'\n'}
          we send to customer phone number
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
          editable={sendSuccess}
        />
        <View style={{marginBottom: 20, paddingHorizontal: 15}}>
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
          <View
            style={{
              marginTop: 10,
              flexDirection: 'row',
            }}>
            <TouchableOpacity
              onPress={sendOTPCode}
              style={{justifyContent: 'center'}}>
              <Text
                style={{
                  fontSize: 16,
                  color: '#78A3E8',
                  textAlignVertical: 'center',
                }}>
                {sendSuccess ? 'Resend' : 'Send'} code
              </Text>
            </TouchableOpacity>
            {sending && (
              <ActivityIndicator
                color={colors.primaryColor}
                size="small"
                style={{marginLeft: 10}}
              />
            )}
            {displayAnimation && !sending && (
              <LottieView
                source={SUCCESS}
                autoPlay
                loop
                style={{
                  height: 30,
                  paddingLeft: 10,
                }}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default InputOPT;

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

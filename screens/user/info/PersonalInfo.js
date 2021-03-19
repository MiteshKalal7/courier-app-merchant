import React, {Component} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Platform,
  Image,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import {Card, Title, TextInput, Divider} from 'react-native-paper';
import {globalStyles} from '../../../global/styles';
import {API_URL} from '../../../global/config';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ripple from 'react-native-material-ripple';
import {launchImageLibrary} from 'react-native-image-picker';
import AsyncStorage from '@react-native-community/async-storage';

export default class PersonalInformation extends Component {
  constructor(props) {
    super(props);
    // console.log('this.props.imagePlaceholder');
    // console.log(this.props.imagePlaceholder);
    this.state = {
      fullName: '',
      email: '',
      mobile: '',
      phone: '',
      address: '',
      password: '',
      confirmPassword: '',
      imageUri: this.props.imagePlaceholder,
      imageType: '',
      imageName: '',
      userId: '',
      loading: false,
      dataLoading: true,
    };
  }

  componentDidMount = async () => {
    let userInfo = await AsyncStorage.getItem('userInfo');
    if (userInfo) {
      userInfo = JSON.parse(userInfo);
      this.setState({
        userId: userInfo.id,
      });
    }
    this.getUserData();
  };

  getUserData = () => {
    console.log(`${API_URL}getUserPersonalInfo` + this.state.userId);
    fetch(`${API_URL}getUserPersonalInfo`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({user_id: this.state.userId}),
    })
      .then((res) => res.json())
      .then((response) => {
        console.log(response);
        const {data} = response;
        this.setState({dataLoading: false});
        if (response.status) {
          this.setState({
            imageUri: data.avatar ?? this.props.imagePlaceholder,
            fullName: data.name,
            email: data.email,
            mobile: data.mobile,
            phone: data.phone,
            address: data.street_addr,
          });
        } else {
          this.props.showSnackbar(response.status_text);
        }
      })
      .catch((err) => {
        console.log(err);
        this.setState({dataLoading: false});
      });
  };

  updateData = () => {
    Keyboard.dismiss();
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (this.state.fullName === '') {
      this.props.showSnackbar('Full name is required');
    } else if (this.state.email === '') {
      this.props.showSnackbar('Email is required');
    } else if (reg.test(this.state.email) === false) {
      this.props.showSnackbar('Email is invalid');
    } else if (this.state.username === '') {
      this.props.showSnackbar('Username is required');
    } else if (this.state.mobile === '') {
      this.props.showSnackbar('Mobile number is required');
    } else if (this.state.address === '') {
      this.props.showSnackbar('Address filed is required');
    } else {
      var photo = {
        uri: this.state.imageUri,
        type: this.state.imageType,
        name: this.state.imageName,
      };

      var bodyData = new FormData();
      bodyData.append('merchant_id', this.state.userId);
      bodyData.append('name', this.state.fullName);
      bodyData.append('email', this.state.email);
      bodyData.append('mobile', this.state.mobile);
      bodyData.append('phone', this.state.phone);
      bodyData.append('street_addr', this.state.address);
      bodyData.append('password', this.state.password);
      bodyData.append('password_confirmation', this.state.confirmPassword);

      if (photo.uri !== '' && photo.type !== '' && photo.name !== '') {
        bodyData.append('avatar', photo);
      }

      // var bodyData = this.createFormData(photo, {merchant_id: this.state.userId});

      // bodyData = JSON.stringify(bodyData);
      console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
      this.setState({loading: true});
      console.log(`${API_URL}updatePersonalInfo` + bodyData);
      fetch(`${API_URL}updatePersonalInfo`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: bodyData,
      })
        .then((res) => res.json())
        .then((response) => {
          console.log(response);
          this.setState({loading: false});
          if (response.status) {
            this.props.showSnackbar(response.status_text, true);
            this.props.goToNextStep();
          } else {
            this.props.showSnackbar(response.status_text);
          }
        })
        .catch((err) => {
          console.log(err);
          this.setState({loading: false});
        });
    }
  };

  render() {
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
        <Card style={{elevation: 5, backgroundColor: colors.secondaryColor}}>
          <Card.Content style={{paddingTop: 5}}>
            <View style={{flexDirection: 'row'}}>
              <Title style={{paddingBottom: 5, color: colors.textColor}}>
                Update Personal Information
              </Title>
              {this.state.dataLoading && (
                <ActivityIndicator
                  size={30}
                  color={colors.primaryColor}
                  style={{marginLeft: 'auto', alignItems: 'center'}}
                />
              )}
            </View>
            <Divider />
            <View
              style={{marginTop: 10, flexDirection: 'row', paddingLeft: 10}}>
              <Text
                style={{color: colors.textColor, textAlignVertical: 'center'}}>
                Profile picture :{' '}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  launchImageLibrary(
                    {
                      mediaType: 'photo',
                      includeBase64: false,
                      maxHeight: 200,
                      maxWidth: 200,
                    },
                    (response) => {
                      if (!response.didCancel) {
                        this.setState({
                          imageName: response.fileName,
                          imageType: response.type,
                          imageUri: response.uri,
                        });
                      }
                    },
                  )
                }>
                <View>
                  {this.state.imageUri ? (
                    <Image
                      source={{
                        uri: this.state.imageUri,
                      }}
                      style={{height: 50, width: 50, borderRadius: 4}}
                      resizeMode={'cover'}
                    />
                  ) : (
                    <Text style={{color: colors.textColor}}>
                      Select Picture
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
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
              label="Mobile"
              value={this.state.mobile}
              onChangeText={(mobile) => {
                this.setState({mobile});
              }}
              keyboardType={'number-pad'}
              style={globalStyles.inputStyle}
              right={
                <TextInput.Icon
                  name={() => (
                    <Icon name={'phone'} size={20} color={colors.textLight} />
                  )}
                />
              }
              theme={inputTheme}
            />
            <TextInput
              label="Alternative Mobile "
              value={this.state.phone}
              onChangeText={(phone) => {
                this.setState({phone});
              }}
              keyboardType={'number-pad'}
              style={globalStyles.inputStyle}
              right={
                <TextInput.Icon
                  name={() => (
                    <Icon
                      name={'phone-alert'}
                      size={20}
                      color={colors.textLight}
                    />
                  )}
                />
              }
              theme={inputTheme}
            />
            <TextInput
              label="Personal Address"
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
            <TextInput
              label="Password"
              value={this.state.password}
              onChangeText={(password) => {
                this.setState({password});
              }}
              style={globalStyles.inputStyle}
              secureTextEntry={true}
              right={
                <TextInput.Icon
                  name={() => (
                    <Icon name={'eye'} size={20} color={colors.textLight} />
                  )}
                />
              }
              theme={inputTheme}
            />
            <Text
              style={{
                color: colors.textLight,
                opacity: 0.7,
                fontSize: 12,
                paddingLeft: 5,
              }}>
              Keep password empty if you don't like to change the password
            </Text>
            <TextInput
              label="Confirm Password"
              value={this.state.confirmPassword}
              onChangeText={(confirmPassword) => {
                this.setState({confirmPassword});
              }}
              style={globalStyles.inputStyle}
              secureTextEntry={true}
              right={
                <TextInput.Icon
                  name={() => (
                    <Icon name={'eye'} size={20} color={colors.textLight} />
                  )}
                />
              }
              theme={inputTheme}
            />
          </Card.Content>
          <View style={{marginBottom: 20, paddingHorizontal: 15}}>
            <Ripple
              style={globalStyles.buttonStyle(colors.primaryColor)}
              disabled={this.state.loading ? true : false}
              onPress={() => this.updateData()}>
              {this.state.loading ? (
                <ActivityIndicator color="#fff" size={26} />
              ) : (
                <Text style={{color: colors.primaryTextColor, fontSize: 20}}>
                  Save & Next
                </Text>
              )}
            </Ripple>
          </View>
        </Card>
      </>
    );
  }
}

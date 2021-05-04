import React, {Component} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
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

export default class CompanyInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      businessName: '',
      email: '',
      mobile: '',
      phone: '',
      address: '',
      productType: '',
      code: '',
      siteUrl: '',
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
    this.getCompanyData();
  };

  getCompanyData = () => {
    console.log(`${API_URL}getMerchantCompany` + this.state.userId);
    fetch(`${API_URL}getMerchantCompany`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({merchant_id: this.state.userId}),
    })
      .then((res) => res.json())
      .then((response) => {
        console.log(response);
        const {data} = response;
        this.setState({dataLoading: false});
        if (response.status) {
          this.setState({
            imageUri: data.logo ?? this.props.imagePlaceholder,
            businessName: data.name,
            email: data.email,
            mobile: data.phone,
            phone: data.alt_phone,
            address: data.address,
            productType: data.product_type,
            code: data.code,
            siteUrl: data.url,
          });
        } else {
          this.props.showSnackbar(response.status_text);
        }
      })
      .catch((err) => {
        console.log('getMerchantCompany ' + err);
        this.setState({dataLoading: false});
      });
  };

  updateData = () => {
    Keyboard.dismiss();
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (this.state.businessName === '') {
      this.props.showSnackbar('Business name is required');
    }  else if (this.state.email === '') {
      this.props.showSnackbar('Email is required');
    } else if (reg.test(this.state.email) === false) {
      this.props.showSnackbar('Email is invalid');
    } else if (this.state.productType === '') {
      this.props.showSnackbar('Product type is required');
    } else {

      var bodyData = new FormData();
      bodyData.append('merchant_id', this.state.userId);
      bodyData.append('name', this.state.businessName);
      bodyData.append('email', this.state.email);
      bodyData.append('phone', this.state.mobile);
      bodyData.append('product_type', this.state.productType);

      this.setState({loading: true});
      console.log(`${API_URL}updateCompanyInfo` + JSON.stringify(bodyData));
      fetch(`${API_URL}updateCompanyInfo`, {
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
                Update Business Information
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
            {/* <View style={{marginTop: 5, flexDirection: 'row', paddingLeft: 10}}>
              <Text
                style={{color: colors.textColor, textAlignVertical: 'center'}}>
                Logo :{' '}
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
                {this.state.imageUri ? (
                  <Image
                    source={{uri: this.state.imageUri}}
                    style={{
                      height: 50,
                      width: 50,
                      marginRight: 20,
                      borderRadius: 4,
                    }}
                  />
                ) : (
                  <Text style={{color: colors.textColor}}>Select Picture</Text>
                )}
              </TouchableOpacity>
            </View> */}
            <TextInput
              label="Business Name"
              value={this.state.businessName}
              onChangeText={(text) => this.setState({businessName: text})}
              style={globalStyles.inputStyle}
              right={
                <TextInput.Icon
                  name={() => (
                    <Icon
                      name={'office-building'}
                      size={20}
                      color={colors.textLight}
                    />
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
              label="Phone"
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
              label="Product Type"
              value={this.state.productType}
              onChangeText={(productType) => {
                this.setState({productType});
              }}
              style={globalStyles.inputStyle}
              right={
                <TextInput.Icon
                  name={() => (
                    <Icon name={'dropbox'} size={20} color={colors.textLight} />
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

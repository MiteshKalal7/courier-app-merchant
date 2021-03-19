import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  Picker,
  Platform,
  UIManager,
  Keyboard,
} from 'react-native';
import {Snackbar, TextInput} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {API_URL} from '../../../global/config';
import {getThemeColors} from '../../../global/themes';
import Ripple from 'react-native-material-ripple';
import {globalStyles} from '../../../global/styles';
import AsyncStorage from '@react-native-community/async-storage';
import {connect} from 'react-redux';
import {setTheme} from '../../../redux/actions/config';
import Loader from './../../common/Loader';
import Header from './../../common/Header';

class Login extends React.Component {
  state = {
    customerMobile: '',
    customerName: '',
    customerAltMobile: '',
    customerId: '',
    area: '',
    district: '',
    customerAddress: '',
    sendFromList: [],
    sendFrom: '',
    message: '',
    deliveryCharge: this.props.currency + '0.00',
    codCharge: this.props.currency + '0.00',
    totalCharge: this.props.currency + '0.00',
    districtList: {},
    areaList: {},
    deliveryTimeList: [],
    address: '',
    deliveryTime: '',
    cashCollection: '',
    productWeight: '',
    userId: '',
    orderId: '',
    visible: false,
    success: false,
    next: false,
    dataLoading: false,
    calculating: false,
  };

  constructor(props) {
    super(props);
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }
  async componentDidMount() {
    // this.checkUserIsLoggedIn();
    let userInfo = await AsyncStorage.getItem('userInfo');
    if (userInfo) {
      userInfo = JSON.parse(userInfo);
      this.setState({
        userId: userInfo.id,
      });
    }

    this.getDistrictList();
    this.getPickupPoint();
  }

  getDistrictList = () => {
    fetch(`${API_URL}districtList`)
      .then((res) => res.json())
      .then(({data}) => {
        this.setState({
          districtList: data,
        });
      });
  };

  getPickupPoint = (sendFrom = '') => {
    fetch(`${API_URL}getPickupPoint`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({merchant_id: this.state.userId}),
    })
      .then((res) => res.json())
      .then(({data}) => {
        console.log(data);
        this.setState(
          {
            sendFromList: data,
          },
          () => {
            if (sendFrom !== '') {
              this.setState({
                sendFrom: sendFrom,
              });
            }
          },
        );
      });
  };

  fetchAreas = (districtId, area = '') => {
    // alert(area);

    this.setState({
      area: area,
    });

    let bodyData = {
      district_id: districtId,
    };

    bodyData = JSON.stringify(bodyData);

    console.log(`${API_URL}areaList` + bodyData);
    fetch(`${API_URL}areaList`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: bodyData,
    })
      .then((res) => res.json())
      .then(({data}) => {
        console.log(data);
        this.setState({areaList: data});
        if (area) {
          // setTimeout(() => {
          this.setState({area: area.toString()});
          // }, 200);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  geDeliveryTime = (districtId, deliveryTime = '') => {
    let bodyData = {
      district_id: districtId,
    };

    bodyData = JSON.stringify(bodyData);

    console.log(`${API_URL}geDeliveryTime` + bodyData);
    fetch(`${API_URL}geDeliveryTime`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: bodyData,
    })
      .then((res) => res.json())
      .then(({data}) => {
        console.log(data);
        this.setState({deliveryTimeList: data}, () => {
          if (deliveryTime !== '') {
            console.log('in');
            this.setState({
              deliveryTime: deliveryTime,
            });
          }
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  getCharge = () => {
    this.setState({calculating: true});
    let bodyData = {
      cash_amount: this.state.cashCollection,
      delivery_time: this.state.deliveryTime ?? '',
      district_id: this.state.district ?? '',
      product_weight: this.state.productWeight,
    };

    bodyData = JSON.stringify(bodyData);

    // console.log('~~~~~~~~~~~~~~~~~~~~~');
    // console.log(bodyData);
    // console.log('~~~~~~~~~~~~~~~~~~~~~');

    console.log(`${API_URL}getCharge` + bodyData);
    fetch(`${API_URL}getCharge`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: bodyData,
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        if (res.status) {
          this.setState({
            deliveryCharge: res.data.delivery_charge,
            codCharge: res.data.cod_charge,
            totalCharge: res.data.total_charge,
            calculating: false,
          });
        } else {
          this.showSnackbar(res.status_text);
        }
        // this.setState({deliveryTimeList: data});
      })
      .catch((err) => {
        console.log(err);
      });
  };

  showSnackbar = (message, status = false) => {
    this.setState({
      visible: true,
      success: status,
      message: message,
    });
  };

  getOrderData = (orderId) => {
    let requestData = JSON.stringify({
      order_id: orderId,
    });
    this.setState({dataLoading: true});

    console.log('###################################');
    console.log(`${API_URL}getOrder` + requestData);
    fetch(`${API_URL}getOrder`, {
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
        this.setState({dataLoading: false});
        let status = response.status;
        let data = response.data.order;

        if (status) {
          this.getPickupPoint(data.sender_address);
          this.fetchAreas(data.customer.district_id, data.customer.area_id);
          // alert('data.delivery_time + ' + data.delivery_time);
          this.geDeliveryTime(data.customer.district_id, data.delivery_time);

          this.setState({
            next: true,
            customerMobile: data.customer.mobile,
            customerAltMobile: data.customer.alt_mobile,
            customerName: data.customer.name,
            district: data.customer.district_id.toString(),
            area: data.customer.area_id.toString(),
            deliveryCharge: this.props.currency + +data.delivery_charge,
            codCharge: this.props.currency + +data.cod_charge,
            totalCharge: this.props.currency + +data.total_charge,
            address: data.customer.address,
            cashCollection: data.cash_amount.toString(),
            productWeight: data.product_weight.toString(),
            orderId: orderId,
          });
        } else {
          this.setState({dataLoading: false});
          this.showSnackbar(response.status_text);
        }
      })
      .catch((err) => {
        console.log(err);
        this.setState({dataLoading: false});
      });
  };

  render() {
    const param = this.props.route.params;
    if (param !== undefined) {
      if (param.screen !== undefined) {
        // alert(param.orderId);
        // this.setState({
        //   orderId: param.orderId,
        // });
        this.getOrderData(param.orderId);
        param.screen = undefined;
      }
    }

    const addShipment = () => {
      if (this.state.customerMobile === '') {
        this.showSnackbar('Username is required');
      } else if (this.state.customerName === '') {
        this.showSnackbar('Customer Name is required');
      } else if (this.state.cashCollection === '') {
        this.showSnackbar('Cash Collection is required');
      } else if (this.state.productWeight === '') {
        this.showSnackbar('Product Weight is required');
      } else if (this.state.district === '') {
        this.showSnackbar('Please select district');
      } else if (this.state.area === '') {
        this.showSnackbar('Please select area');
      } else if (this.state.deliveryTime === '') {
        this.showSnackbar('Please select delivery time');
      } else if (this.state.address === '') {
        this.showSnackbar('Address is required');
      } else if (this.state.sendFrom === '') {
        this.showSnackbar('Please select send from address');
      } else {
        let requestData = JSON.stringify({
          mobile: this.state.customerMobile,
          fromApp: 1,
          order_id: this.state.orderId,
          client_id: this.state.userId,
          sender_address: this.state.sendFrom,
          alt_mobile: this.state.customerAltMobile,
          customer_id: this.state.customerId,
          name: this.state.customerName,
          district_id: this.state.district,
          area_id: this.state.area,
          address: this.state.address,
          delivery_time: this.state.deliveryTime,
          cash_amount: this.state.cashCollection,
          product_weight: this.state.productWeight,
          client_reference: '',
        });
        this.setState({loading: true});
        console.log('###################################');
        console.log(`${API_URL}addOReditOrder` + requestData);
        fetch(`${API_URL}addOReditOrder`, {
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
              this.setState({
                next: false,
                customerMobile: '',
                customerAltMobile: '',
                customerName: '',
                area: '',
                district: '',
                customerAddress: '',
                sendFrom: '',
                deliveryCharge: this.props.currency + '0.00',
                codCharge: this.props.currency + '0.00',
                totalCharge: this.props.currency + '0.00',
                address: '',
                deliveryTime: '',
                cashCollection: '',
                productWeight: '',
              });
              this.props.navigation.navigate('Dashboard', {
                status: true,
                message: response.status_text,
                screen: 'Create',
              });
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

    const next = () => {
      Keyboard.dismiss();
      if (this.state.sendFrom === '') {
        this.showSnackbar('Send from is required');
      } else if (this.state.customerMobile === '') {
        this.showSnackbar('Customer Mobile is required');
      } else {
        let requestData = JSON.stringify({
          mobile: this.state.customerMobile,
        });
        this.setState({loading: true});
        console.log(`${API_URL}getCustomer` + requestData);
        fetch(`${API_URL}getCustomer`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: requestData,
        })
          .then((res) => res.json())
          .then((response) => {
            console.log('customer');
            console.log(response);
            this.setState({
              next: true,
              loading: false,
            });
            // LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
            let status = response.status;

            if (status && response.data !== null) {
              //   console.log('success'); customerId

              let data = response.data;
              // alert(data.area_id);
              this.setState({
                address: data.address,
                customerAltMobile: data.alt_mobile,
                district: data.district_id.toString(),
                // area: data.area_id.toString(),
                customerName: data.name,
              });
              this.fetchAreas(data.district_id, data.area_id);
              this.geDeliveryTime(data.district_id);
            }
            // else {
            //   this.setState({loading: false, next: true});
            //   this.showSnackbar(response.status_text);
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
        <Header
          title={(this.state.orderId ? 'Edit ' : 'Create New ') + 'Shipment'}
        />
        <View style={styles.container(colors.secondaryColor)}>
          <View
            style={{
              backgroundColor: colors.cardColor,
              padding: 10,
              borderRadius: 15,
              marginTop: 10,
              marginBottom: 15,
              elevation: 5,
              marginHorizontal: 10,
            }}>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.cardTextStyle(colors.textLight)}>
                Delivery Charge :
              </Text>
              <View style={{marginLeft: 'auto', flexDirection: 'row'}}>
                {this.state.calculating && (
                  <ActivityIndicator
                    color={colors.textColor}
                    size="small"
                    style={{marginRight: 5}}
                  />
                )}
                <Text style={styles.cardTextStyle(colors.textLight)}>
                  {this.state.deliveryCharge}
                </Text>
              </View>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.cardTextStyle(colors.textLight)}>
                COD Charge :
              </Text>
              <View style={{marginLeft: 'auto', flexDirection: 'row'}}>
                {this.state.calculating && (
                  <ActivityIndicator
                    color={colors.textColor}
                    size="small"
                    style={{marginRight: 5}}
                  />
                )}
                <Text style={styles.cardTextStyle(colors.textLight)}>
                  {this.state.codCharge}
                </Text>
              </View>
            </View>

            <View
              style={{
                borderBottomColor: colors.textColor,
                borderBottomWidth: 1,
                opacity: 0.3,
                paddingVertical: 2,
              }}
            />
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.cardTextStyle(colors.textLight)}>
                Total Charge :
              </Text>
              <View style={{marginLeft: 'auto', flexDirection: 'row'}}>
                {this.state.calculating && (
                  <ActivityIndicator
                    color={colors.textColor}
                    size="small"
                    style={{marginRight: 5}}
                  />
                )}
                <Text style={styles.cardTextStyle(colors.textLight)}>
                  {this.state.totalCharge}
                </Text>
              </View>
            </View>
          </View>

          <ScrollView keyboardShouldPersistTaps="always">
            <View
              style={{
                paddingHorizontal: 10,
                marginBottom: 20,
              }}>
              {/* <Title style={{color: colors.textColor}}>Create New Shipment</Title> */}

              <View style={{justifyContent: 'center'}}>
                <Picker
                  selectedValue={this.state.sendFrom}
                  style={{
                    height: 50,
                    marginTop: 5,
                    color: colors.textColor,
                    marginLeft: 5,
                  }}
                  onValueChange={(itemValue) => {
                    this.setState({sendFrom: itemValue});
                  }}>
                  <Picker.Item label="Send From" value="" />
                  {this.state.sendFromList.length > 0 &&
                    this.state.sendFromList.map((value) => {
                      return (
                        <Picker.Item label={value.title} value={value.value} />
                      );
                    })}
                </Picker>

                <TextInput
                  label="Customer Mobile"
                  value={this.state.customerMobile}
                  onChangeText={(customerMobile) => {
                    this.setState({customerMobile});
                  }}
                  style={globalStyles.inputStyle}
                  keyboardType={'number-pad'}
                  right={
                    <TextInput.Icon
                      name={() => (
                        <Icon
                          name={'phone'}
                          size={20}
                          color={colors.textLight}
                        />
                      )}
                    />
                  }
                  theme={inputTheme}
                />

                {this.state.next && (
                  <>
                    <TextInput
                      theme={inputTheme}
                      label="Customer Name"
                      value={this.state.customerName}
                      onChangeText={(customerName) => {
                        this.setState({customerName});
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
                    />
                    <TextInput
                      theme={inputTheme}
                      label="Alternative Mobile"
                      value={this.state.customerAltMobile}
                      onChangeText={(customerAltMobile) => {
                        this.setState({customerAltMobile});
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
                    />

                    <TextInput
                      theme={inputTheme}
                      label="Cash Collection"
                      value={this.state.cashCollection}
                      onChangeText={(cashCollection) => {
                        this.setState({cashCollection}, () => {
                          this.getCharge();
                        });
                      }}
                      maxLength={10}
                      keyboardType={'number-pad'}
                      style={globalStyles.inputStyle}
                      right={
                        <TextInput.Icon
                          name={() => (
                            <Icon
                              name={'currency-bdt'}
                              size={20}
                              color={colors.textLight}
                            />
                          )}
                        />
                      }
                    />
                    <TextInput
                      theme={inputTheme}
                      label="Product Weight"
                      value={this.state.productWeight}
                      onChangeText={(productWeight) => {
                        this.setState({productWeight}, () => {
                          this.getCharge();
                        });
                      }}
                      keyboardType={'number-pad'}
                      style={globalStyles.inputStyle}
                      right={
                        <TextInput.Icon
                          name={() => (
                            <Icon
                              name={'weight-kilogram'}
                              size={20}
                              color={colors.textLight}
                            />
                          )}
                        />
                      }
                    />
                    {/* <TextInput
                      theme={inputTheme}
                      label="Order Number"
                      value={this.state.orderNumber}
                      onChangeText={(orderNumber) => {
                        this.setState({orderNumber});
                      }}
                      style={globalStyles.inputStyle}
                      right={
                        <TextInput.Icon
                          name={() => (
                            <Icon
                              name={'order-numeric-ascending'}
                              size={20}
                              color={colors.textLight}
                            />
                          )}
                        />
                      }
                    /> */}

                    <Picker
                      selectedValue={this.state.district}
                      style={{
                        height: 50,
                        marginVertical: 5,
                        color: colors.textColor,
                        marginLeft: 5,
                      }}
                      onValueChange={(itemValue) => {
                        this.fetchAreas(itemValue);
                        this.geDeliveryTime(itemValue);
                        this.setState({district: itemValue}, () => {
                          this.getCharge();
                        });
                      }}>
                      <Picker.Item label="Select District" value="" />
                      {this.state.districtList &&
                        Object.keys(this.state.districtList).map((key) => {
                          return (
                            <Picker.Item
                              label={this.state.districtList[key]}
                              value={key}
                            />
                          );
                        })}
                    </Picker>

                    <Picker
                      selectedValue={this.state.area}
                      style={{
                        height: 50,
                        marginVertical: 5,
                        color: colors.textColor,
                        marginLeft: 5,
                      }}
                      onValueChange={(itemValue) => {
                        this.setState({area: itemValue});
                      }}>
                      <Picker.Item label="Select Area" value="" />
                      {this.state.areaList &&
                        Object.keys(this.state.areaList).map((key) => {
                          return (
                            <Picker.Item
                              label={this.state.areaList[key]}
                              value={key}
                            />
                          );
                        })}
                    </Picker>

                    <Picker
                      selectedValue={this.state.deliveryTime}
                      style={{
                        height: 50,
                        marginVertical: 5,
                        color: colors.textColor,
                        marginLeft: 5,
                      }}
                      onValueChange={(itemValue) => {
                        this.setState({deliveryTime: itemValue}, () => {
                          this.getCharge();
                        });
                      }}>
                      <Picker.Item label="Select Delivery Time" value="" />
                      {this.state.deliveryTimeList.length > 0 &&
                        this.state.deliveryTimeList.map((value) => {
                          return (
                            <Picker.Item
                              label={value.text}
                              value={value.value}
                            />
                          );
                        })}
                    </Picker>

                    <TextInput
                      label="Detail Address"
                      value={this.state.address}
                      onChangeText={(address) => {
                        this.setState({address});
                      }}
                      style={globalStyles.inputStyle}
                      multiline={true}
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
                  </>
                )}

                <Ripple
                  style={globalStyles.buttonStyle(colors.primaryColor)}
                  disabled={this.state.loading ? true : false}
                  onPress={() => (this.state.next ? addShipment() : next())}>
                  {this.state.loading ? (
                    <ActivityIndicator color="#fff" size={26} />
                  ) : (
                    <Text
                      style={{color: colors.primaryTextColor, fontSize: 20}}>
                      {this.state.next ? 'Save' : 'Next'}
                    </Text>
                  )}
                </Ripple>
              </View>
            </View>
          </ScrollView>
        </View>
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
        {this.state.dataLoading && <Loader color={colors.primaryColor} />}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  var theme = getThemeColors(state.theme, state.brand);
  let brand = state.brand;
  brand = JSON.parse(brand);
  return {colors: theme, theme: state.theme, currency: brand.currency};
};

export default connect(mapStateToProps, {
  setUserTheme: setTheme,
})(Login);

const styles = StyleSheet.create({
  container: (bgColor) => ({
    flex: 1,
    backgroundColor: bgColor,
  }),
  cardTextStyle: (color) => ({
    color: color,
    paddingVertical: 2,
    fontSize: 16,
  }),
});

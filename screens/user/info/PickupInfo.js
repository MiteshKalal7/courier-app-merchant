import React, {Component} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  Picker,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Title,
  TextInput,
  Divider,
  TouchableRipple,
  Button,
  Subheading,
} from 'react-native-paper';
import {globalStyles} from '../../../global/styles';
import {API_URL} from '../../../global/config';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ripple from 'react-native-material-ripple';
import AsyncStorage from '@react-native-community/async-storage';
import Modal from 'react-native-modal';
import {colors} from '../../../global/themes';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import Geolocation from 'react-native-geolocation-service';
import {color} from 'react-native-reanimated';

export default class PickupInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      address: '',
      district: '',
      area: '',
      userId: '',
      latitude: '',
      longitude: '',
      addresses: [],
      districtList: {},
      areaList: {},
      loading: false,
      dataLoading: true,
      editIndex: 0,
      edit: false,
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
    // if (!this.state.addresses.length) {
    //   this.setState({
    //     isModalVisible: true,
    //   });
    // }
    this.getPickup();
    this.getDistrictList();
  };

  getPickup = () => {
    console.log(`${API_URL}getPickupAddress` + this.state.userId);
    fetch(`${API_URL}getPickupAddress`, {
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
          if (data.length === 0) {
            this.setState({
              isModalVisible: true,
            });
          } else {
            this.setState({
              addresses: data.address,
              isModalVisible: data.address.length > 0 ? false : true,
            });
          }
        } else {
          this.props.showSnackbar(response.status_text);
        }
      })
      .catch((err) => {
        console.log(err);
        this.setState({dataLoading: false});
      });
  };

  getDistrictList = () => {
    console.log(`${API_URL}districtList`);
    fetch(`${API_URL}districtList`)
      .then((res) => res.json())
      .then(({data}) => {
        console.log(data);
        this.setState({
          districtList: data,
        });
      });
  };

  fetchAreas = (districtId) => {
    this.setState({
      area: '',
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
      })
      .catch((err) => {
        console.log(err);
      });
  };

  getCurrentLocation = () => {
    RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
      interval: 10000,
      fastInterval: 5000,
    })
      .then((data) => {
        // console.log('DAta = ' + data);
        Geolocation.getCurrentPosition(
          ({coords}) => {
            // alert(coords.latitude.toString());
            this.setState(
              {
                latitude: coords.latitude.toString(),
                longitude: coords.longitude.toString(),
              },
              () => {
                this.addItem();
              },
            );
          },
          (error) => {
            this.addItem();
            console.log(error.code, error.message);
          },
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        );
      })
      .catch((err) => {
        console.log(err);
        this.addItem();
      });
  };

  updateData = () => {
    this.setState({loading: true});

    let bodyData = {
      addresses: this.state.addresses,
      merchant_id: this.state.userId,
    };

    bodyData = JSON.stringify(bodyData);

    console.log(`${API_URL}addORupdatePickupAddress` + bodyData);
    fetch(`${API_URL}addORupdatePickupAddress`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: bodyData,
    })
      .then((res) => res.json())
      .then((response) => {
        console.log(response);
        this.setState({loading: false});
        if (response.status) {
          this.props.showSnackbar(response.status_text, true);
          this.props.goToNextStep('COMPLETED');
        } else {
          this.props.showSnackbar(response.status_text);
        }
      })
      .catch((err) => {
        console.log(err);
        this.setState({loading: false});
      });
  };

  removePickupInfo = (index) => {
    Alert.alert(
      'Are you sure?',
      'You want to remove this information.',
      [
        {text: 'Cancel', onPress: () => null},
        {
          text: 'OK',
          onPress: () => {
            var array = this.state.addresses;
            array.splice(index, 1);
            this.setState({
              addresses: array,
            });
            if (array.length === 0) {
              this.setState({
                isModalVisible: true,
                title: '',
                address: '',
                district: '',
                area: '',
                latitude: '',
                longitude: '',
              });
            }
          },
        },
      ],
      {cancelable: false},
    );
  };

  addItem = () => {
    // alert(this.state.area);
    if (
      this.state.title === '' ||
      this.state.address === '' ||
      this.state.district === undefined ||
      this.state.area === undefined ||
      this.state.area === ''
    ) {
      this.props.showSnackbar('Fill all fields');
    } else if (this.state.edit) {
      let addresses = this.state.addresses;
      let editAddress = {
        title: this.state.title,
        street: this.state.address,
        district: this.state.district,
        area: this.state.area,
        lat: this.state.latitude,
        lng: this.state.longitude,
      };

      addresses = addresses.map((u, index) =>
        this.state.editIndex !== index ? u : editAddress,
      );

      this.setState({
        addresses: addresses,
        isModalVisible: false,
      });
    } else {
      this.setState({
        addresses: [
          ...this.state.addresses,
          {
            title: this.state.title,
            street: this.state.address,
            district: this.state.district,
            area: this.state.area,
            lat: this.state.latitude,
            lng: this.state.longitude,
          },
        ],
        isModalVisible: false,
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
        <Modal isVisible={this.state.isModalVisible}>
          <View
            style={{
              // flex: 1,
              backgroundColor: colors.secondaryColor,
              borderRadius: 20,
              justifyContent: 'center',
            }}>
            <Title
              style={{
                marginVertical: 10,
                paddingLeft: 10,
                color: colors.textColor,
              }}>
             Pick up location
            </Title>
            <Divider style={{borderBottomWidth: 1}} />
            <View style={{paddingHorizontal: 10}}>
              <TextInput
                label="Title"
                value={this.state.title}
                onChangeText={(title) => this.setState({title})}
                style={globalStyles.inputStyle}
                right={
                  <TextInput.Icon
                    name={() => (
                      <Icon
                        name={'format-title'}
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

              <Picker
                selectedValue={this.state.district}
                style={{height: 50, marginVertical: 5, color: colors.textColor}}
                onValueChange={(itemValue) => {
                  this.fetchAreas(itemValue);
                  this.setState({district: itemValue});
                }}>
                <Picker.Item label="Select District" />
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
                style={{height: 50, marginTop: 5, color: colors.textColor}}
                onValueChange={(itemValue) => {
                  this.setState({area: itemValue});
                }}>
                <Picker.Item label="Select Area" />
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

              {/* <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <TextInput
                  label="Latitude"
                  value={this.state.latitude}
                  onChangeText={(latitude) => {
                    this.setState({latitude});
                  }}
                  style={[
                    globalStyles.inputStyle,
                    {width: '47%', marginTop: 0},
                  ]}
                  keyboardType={'number-pad'}
                  right={
                    <TextInput.Icon
                      name={() => (
                        <Icon
                          name={'latitude'}
                          size={20}
                          color={colors.textLight}
                        />
                      )}
                    />
                  }
                  theme={inputTheme}
                />
                <TextInput
                  label="Longitude"
                  value={this.state.longitude}
                  onChangeText={(longitude) => {
                    this.setState({longitude});
                  }}
                  style={[
                    globalStyles.inputStyle,
                    {width: '47%', marginTop: 0},
                  ]}
                  keyboardType={'number-pad'}
                  right={
                    <TextInput.Icon
                      name={() => (
                        <Icon
                          name={'longitude'}
                          size={20}
                          color={colors.textLight}
                        />
                      )}
                    />
                  }
                  theme={inputTheme}
                />
              </View> */}
              {/* <TouchableOpacity
                style={{marginLeft: 'auto', marginBottom: 15}}
                onPress={() => {
                  this.getCurrentLocation();
                }}>
                <Text style={{color: colors.textLight}}>
                  Get current location
                </Text>
              </TouchableOpacity> */}

              <View
                style={{
                  flexDirection: 'row',
                  marginBottom: 20,
                  justifyContent: 'space-around',
                  marginTop: 10,
                }}>
                <Button
                  onPress={() => {
                    this.setState({
                      isModalVisible: false,
                    });
                  }}
                  // disabled={!this.state.addresses.length ? true : false}
                  color={colors.primaryColor}
                  labelStyle={{fontSize: 17}}
                  mode="contained">
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  disabled={
                    this.state.mobileBankName === '' ||
                    this.state.mobileBankNumber === ''
                      ? true
                      : false
                  }
                  labelStyle={{fontSize: 17}}
                  color={colors.primaryColor}
                  onPress={() => {
                    this.getCurrentLocation();
                  }}>
                  Add
                </Button>
              </View>
            </View>
          </View>
        </Modal>

        <Card style={{elevation: 5, backgroundColor: colors.secondaryColor}}>
          <Card.Content style={{paddingTop: 5}}>
            <View style={{flexDirection: 'row'}}>
              <Title style={{paddingBottom: 5, color: colors.textColor}}>
                Addresses
              </Title>
              {this.state.dataLoading ? (
                <ActivityIndicator
                  size={30}
                  color={colors.primaryColor}
                  style={{marginLeft: 'auto', alignItems: 'center'}}
                />
              ) : (
                <TouchableRipple
                  onPress={() =>
                    this.setState({
                      title: '',
                      address: '',
                      district: '',
                      area: '',
                      latitude: '',
                      longitude: '',
                      edit: false,
                      isModalVisible: true,
                    })
                  }
                  borderless={true}
                  centered={true}
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    // margin: 6,
                    backgroundColor: colors.primaryColor,
                    width: 50,
                    height: 50,
                    borderRadius: (30 * 1.2) / 2,
                    marginLeft: 'auto',
                  }}
                  rippleColor="rgba(0, 0, 0, .32)">
                  <Icon size={30} name="plus" color="white" />
                </TouchableRipple>
              )}
            </View>
            <Divider />

            <View style={{marginTop: 10}}>
              {this.state.addresses.length > 0 && (
                <>
                  {this.state.addresses.map((item, i) => {
                    return (
                      <>
                        <View style={{paddingVertical: 10}}>
                          <View style={{flexDirection: 'row'}}>
                            <View>
                              <Subheading style={{color: colors.textLight}}>
                                Title: {item.title}
                              </Subheading>
                              <Subheading style={{color: colors.textLight}}>
                                Address: {item.street}
                              </Subheading>
                              <Subheading style={{color: colors.textLight}}>
                                Area:{' '}
                                {this.state.areaList &&
                                  Object.keys(this.state.areaList).map(
                                    (k) =>
                                      k == item.area && this.state.areaList[k],
                                  )}
                              </Subheading>
                              <Subheading style={{color: colors.textLight}}>
                                District:
                                {this.state.districtList &&
                                  Object.keys(this.state.districtList).map(
                                    (k) =>
                                      k == item.district &&
                                      this.state.districtList[k],
                                  )}
                              </Subheading>
                              {/* <Subheading style={{color: colors.textLight}}>
                                Latitude: {item.lat}
                              </Subheading>
                              <Subheading style={{color: colors.textLight}}>
                                Longitude: {item.lng}
                              </Subheading> */}
                            </View>
                            <View
                              style={{
                                marginLeft: 'auto',
                                justifyContent: 'space-between',
                              }}>
                              <TouchableRipple
                                onPress={() => {
                                  this.fetchAreas(item.district);
                                  this.setState({
                                    title: item.title,
                                    address: item.street,
                                    district: item.district,
                                    area: item.area,
                                    latitude: item.lat,
                                    longitude: item.lng,
                                    editIndex: i,
                                    edit: true,
                                    isModalVisible: true,
                                  });
                                }}
                                borderless={true}
                                centered={true}
                                style={{
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  overflow: 'hidden',
                                  width: 27 * 1.5,
                                  height: 27 * 1.5,
                                  borderRadius: (27 * 1.5) / 2,
                                }}
                                rippleColor="rgba(0, 0, 0, .32)">
                                <Icon
                                  size={27}
                                  name="lead-pencil"
                                  color="green"
                                />
                              </TouchableRipple>
                              <TouchableRipple
                                onPress={() => this.removePickupInfo(i)}
                                borderless={true}
                                centered={true}
                                style={{
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  overflow: 'hidden',
                                  width: 27 * 1.5,
                                  height: 27 * 1.5,
                                  borderRadius: (27 * 1.5) / 2,
                                }}
                                rippleColor="rgba(0, 0, 0, .32)">
                                <Icon size={27} name="delete" color="red" />
                              </TouchableRipple>
                            </View>
                          </View>
                        </View>
                        <Divider />
                      </>
                    );
                  })}
                </>
              )}
            </View>
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
                  Complete
                </Text>
              )}
            </Ripple>
          </View>
        </Card>
      </>
    );
  }
}

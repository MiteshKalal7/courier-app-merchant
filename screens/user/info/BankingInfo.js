import React, {Component} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  Picker,
  Keyboard,
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

export default class BankingInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accountName: '',
      accountNumber: '',
      accountWith: '',
      isModalVisible: false,
      userId: '',
      mobileBanks: [],
      mobileBankName: '',
      mobileBankNumber: '',
      mobileBankType: '',
      dataLoading: true,
      loading: false,
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
    this.getBankData();
  };

  getBankData = () => {
    console.log(`${API_URL}getMerchantBank` + this.state.userId);
    fetch(`${API_URL}getMerchantBank`, {
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
            mobileBanks: data.mobile_banks,
            accountName: data.account_name,
            accountNumber: data.account_number,
            accountWith: data.bank_name,
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
    if (this.state.accountName === '') {
      this.props.showSnackbar('Account name is required');
    } else if (this.state.accountNumber === '') {
      this.props.showSnackbar('Account number required');
    } else if (this.state.accountWith === '') {
      this.props.showSnackbar('Bank name is required');
    } else {
      this.setState({loading: true});

      let bodyData = {
        account_name: this.state.accountName,
        account_number: this.state.accountNumber,
        bank_name: this.state.accountWith,
        mobile_banks: this.state.mobileBanks,
        merchant_id: this.state.userId,
      };

      bodyData = JSON.stringify(bodyData);

      console.log(`${API_URL}addORupdateBankInfo` + bodyData);
      fetch(`${API_URL}addORupdateBankInfo`, {
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

  removeMobileBank = (index) => {
    Alert.alert(
      'Are you sure?',
      'You want to remove this information.',
      [
        {text: 'Cancel', onPress: () => null},
        {
          text: 'OK',
          onPress: () => {
            var array = this.state.mobileBanks;
            array.splice(index, 1);
            this.setState({
              mobileBanks: array,
            });
          },
        },
      ],
      {cancelable: false},
    );
  };

  addItem = () => {
    if (this.state.edit) {
      let bankInfo = this.state.mobileBanks;
      let editAddress = {
        name: this.state.mobileBankName,
        account_number: this.state.mobileBankNumber,
        account_type: this.state.mobileBankType,
      };

      bankInfo = bankInfo.map((u, index) =>
        this.state.editIndex !== index ? u : editAddress,
      );

      this.setState({
        mobileBanks: bankInfo,
        isModalVisible: false,
      });
    } else {
      this.setState({
        mobileBanks: [
          ...this.state.mobileBanks,
          {
            name: this.state.mobileBankName,
            account_number: this.state.mobileBankNumber,
            account_type: this.state.mobileBankType,
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
              Mobile Bank Information
            </Title>
            <Divider style={{borderBottomWidth: 1}} />
            <View style={{paddingHorizontal: 10}}>
              <TextInput
                label="Mobile Bank Name"
                value={this.state.mobileBankName}
                onChangeText={(text) => this.setState({mobileBankName: text})}
                style={globalStyles.inputStyle}
                right={
                  <TextInput.Icon
                    name={() => (
                      <Icon name={'bank'} size={20} color={colors.textLight} />
                    )}
                  />
                }
                theme={inputTheme}
              />
              <TextInput
                label="Account Number"
                value={this.state.mobileBankNumber}
                onChangeText={(mobileBankNumber) => {
                  this.setState({mobileBankNumber});
                }}
                keyboardType={'number-pad'}
                style={globalStyles.inputStyle}
                right={
                  <TextInput.Icon
                    name={() => (
                      <Icon name={'bank'} size={20} color={colors.textLight} />
                    )}
                  />
                }
                theme={inputTheme}
              />
              <Picker
                selectedValue={this.state.mobileBankType}
                style={{height: 50, marginVertical: 5, color: colors.textColor}}
                onValueChange={(itemValue) => {
                  this.setState({mobileBankType: itemValue});
                }}>
                <Picker.Item label="Personal" value="1" />
                <Picker.Item label="Merchant" value="2" />
              </Picker>

              <View
                style={{
                  flexDirection: 'row',
                  marginBottom: 20,
                  justifyContent: 'space-around',
                }}>
                <Button
                  onPress={() => {
                    this.setState({
                      isModalVisible: false,
                    });
                  }}
                  color={colors.primaryColor}
                  labelStyle={{fontSize: 17}}
                  mode="contained">
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  // disabled={
                  //   this.state.mobileBankName === '' ||
                  //   this.state.mobileBankNumber === ''
                  //     ? true
                  //     : false
                  // }
                  labelStyle={{fontSize: 17}}
                  color={colors.primaryColor}
                  onPress={() => {
                    this.addItem();
                  }}>
                  Add
                </Button>
              </View>
            </View>
          </View>
        </Modal>

        <Card style={{elevation: 5, backgroundColor: colors.secondaryColor}}>
          <Card.Content style={{paddingTop: 5}}>
            <View style={{flexDirection: 'row', marginBottom: 7}}>
              <Text>
                <Title style={{paddingBottom: 5, color: colors.textColor}}>
                  Bank Account
                </Title>

                <Text
                  style={{
                    opacity: 0.2,
                    color: colors.textLight,
                    fontSize: 14,
                  }}>
                  {'\n'}Provide your valid bank info
                </Text>
              </Text>
              {this.state.dataLoading && (
                <ActivityIndicator
                  size={30}
                  color={colors.primaryColor}
                  style={{marginLeft: 'auto', alignItems: 'center'}}
                />
              )}
            </View>
            <Divider />
            <TextInput
              label="Account Name"
              value={this.state.accountName}
              onChangeText={(text) => this.setState({accountName: text})}
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
              label="Account Number"
              value={this.state.accountNumber}
              onChangeText={(accountNumber) => {
                this.setState({accountNumber});
              }}
              keyboardType={'number-pad'}
              style={globalStyles.inputStyle}
              right={
                <TextInput.Icon
                  name={() => (
                    <Icon
                      name={'bank-outline'}
                      size={20}
                      color={colors.textLight}
                    />
                  )}
                />
              }
              theme={inputTheme}
            />
            <TextInput
              label="Account With"
              value={this.state.accountWith}
              onChangeText={(accountWith) => {
                this.setState({accountWith});
              }}
              style={globalStyles.inputStyle}
              right={
                <TextInput.Icon
                  name={() => (
                    <Icon name={'bank'} size={20} color={colors.textLight} />
                  )}
                />
              }
              theme={inputTheme}
            />

            <View style={{marginTop: 10}}>
              {this.state.mobileBanks && (
                <View>
                  <View style={{flexDirection: 'row', marginBottom: 7}}>
                    <Title style={{color: colors.textColor}}>
                      Mobile Bank Information
                    </Title>
                    <TouchableRipple
                      onPress={() =>
                        this.setState({
                          mobileBankName: '',
                          mobileBankNumber: '',
                          mobileBankType: '',
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
                        height: 45,
                        borderRadius: (30 * 1.2) / 2,
                        marginLeft: 'auto',
                      }}
                      rippleColor="rgba(0, 0, 0, .32)">
                      <Icon size={30} name="plus" color="white" />
                    </TouchableRipple>
                  </View>
                  <Divider />
                  {this.state.mobileBanks.map((item, i) => {
                    return (
                      <>
                        <View style={{paddingVertical: 10}} key={i}>
                          <View style={{flexDirection: 'row'}}>
                            <View>
                              <Subheading style={{color: colors.textLight}}>
                                Bank Name: {item.name}
                              </Subheading>
                              <Subheading style={{color: colors.textLight}}>
                                Account Number: {item.account_number}
                              </Subheading>
                              <Subheading style={{color: colors.textLight}}>
                                Account Type:{' '}
                                {item.account_type === '1'
                                  ? 'Personal'
                                  : 'Merchant'}
                              </Subheading>
                            </View>
                            <View
                              style={{
                                marginLeft: 'auto',
                                justifyContent: 'space-between',
                              }}>
                              <TouchableRipple
                                onPress={() =>
                                  this.setState({
                                    mobileBankName: item.name,
                                    mobileBankNumber: item.account_number,
                                    mobileBankType: item.account_type,
                                    editIndex: i,
                                    edit: true,
                                    isModalVisible: true,
                                  })
                                }
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
                                onPress={() => this.removeMobileBank(i)}
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
                </View>
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

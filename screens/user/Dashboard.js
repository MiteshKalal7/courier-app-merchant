import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
} from 'react-native';
import Ripple from 'react-native-material-ripple';
import SplashScreen from 'react-native-splash-screen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../common/Header';
import Accordian from './../common/Accordian';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {ScrollView} from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage';
import {API_URL} from '../../global/config';
import {TouchableRipple, Snackbar, Title} from 'react-native-paper';
import {connect} from 'react-redux';
import {getThemeColors} from '../../global/themes';
import rocketAnim from './../common/rocketAnim.json';
import shippingTruck from './../common/shipping-truck.json';
import DeliveryMan from './../common/delivery-man.json';
import LottieView from 'lottie-react-native';
import AnimatedPullToRefresh from 'react-native-animated-pull-to-refresh';
import Loader from '../common/Loader';
import LinearGradient from 'react-native-linear-gradient';
import Menu, {MenuItem} from 'react-native-material-menu';
import messaging from '@react-native-firebase/messaging';
import InputOTP from './../common/InputOTP';
import DateTimePicker from '@react-native-community/datetimepicker';
import notifee from '@notifee/react-native';

const vh = Dimensions.get('window').height * 0.01;

class Dashboard extends Component {
  constructor(props) {
    super(props);

    // messaging()
    //   .getToken()
    //   .then((token) => {
    //     console.log(token);
    //   });

    this.state = {
      contentLoading: true,
      orderSummery: {},
      financialSummery: {},
      renderData: [],
      selectedItem: [],
      blinkIds: [],
      selected: false,
      visible: false,
      success: false,
      message: '',
      isRefreshing: false,
      showLoading: false,
      pageMeta: {},
      filters: {},
      filterType: 'all',
      filteringRecords: false,
      loadMore: true,
      page: 1,
      activeColor: '',
      isModalVisible: false,
      date: new Date(),
      mode: 'date',
      showDatePicker: false,
    };

    // alert(this.props.currency);

    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  setMenuRef = (ref) => {
    this._menu = ref;
  };

  hideMenu = () => {
    this._menu.hide();
  };

  showMenu = () => {
    this._menu.show();
  };

  onDateChange = ({nativeEvent}, selectedDate) => {
    // const currentDate = selectedDate ;
    if (selectedDate !== undefined) {
      if (this.state.mode === 'date') {
        this.setState({
          mode: 'time',
          date: selectedDate,
        });
      } else {
        // console.log('!!!!!!!!!!!!!!!!!!!!1');
        // alert(selectedDate);
        // console.log(nativeEvent.timestamp);

        this.setState(
          {
            showDatePicker: false,
            mode: 'date',
            date: nativeEvent.timestamp,
          },
          () => {
            this.rescheduleOrder(nativeEvent.timestamp);
          },
        );
      }
    } else {
      this.setState({
        showDatePicker: false,
      });
    }
  };

  rescheduleOrder = (date) => {
    // alert(JSON.stringify(date));

    let newDate = JSON.stringify(date);
    newDate = newDate.split(':');

    newDate = newDate[0] + ':' + newDate[1];

    newDate = newDate.replace('"', '');
    console.log(newDate);

    this.setState({showLoading: true});
    console.log(
      `${API_URL}reschedule`,
      JSON.stringify({
        id: this.state.orderId,
        user_id: this.state.userId,
        at: newDate,
      }),
    );
    fetch(`${API_URL}reschedule`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: this.state.orderId,
        user_id: this.state.userId,
        at: newDate,
      }),
    })
      .then((res) => res.json())
      .then((response) => {
        this.setState({showLoading: false});
        console.log(response);
        if (response.status) {
          var renderData = [...this.state.renderData];

          renderData.map((item) => {
            if (item.id === this.state.orderId) {
              item.delivery_date = response.rescheduled_at.date;
              item.delivery_time = response.rescheduled_at.time;
              return;
            }
          });

          LayoutAnimation.configureNext({
            duration: 500,
            create: {
              type: LayoutAnimation.Types.easeInEaseOut,
              property: LayoutAnimation.Properties.opacity,
            },
            update: {type: LayoutAnimation.Types.easeInEaseOut},
          });

          this.setState({renderData});
          this.showSnackbar(response.data, true);

          // this.updateRecords();
        } else {
          this.showSnackbar(response.data, true);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // updateRecords = () => {
  //   this.setState(
  //     {
  //       page: 1,
  //       loadMore: true,
  //     },
  //     () => {
  //       this.driverOrderList(this.state.filterType, true);
  //     },
  //   );
  // };

  async componentDidMount() {
    SplashScreen.hide();

    await notifee.createChannel({
      id: 'custom-sound',
      name: 'System Sound',
      sound: 'notification.mp3',
    });

    messaging().onMessage(async (remoteMessage) => {
      await notifee.displayNotification({
        title: remoteMessage.notification.title,
        body: remoteMessage.notification.body,
        android: {
          channelId: 'custom-sound',
        },
      });
    });

    // return unsubscribe;

    let userInfo = await AsyncStorage.getItem('userInfo');
    if (userInfo) {
      userInfo = JSON.parse(userInfo);
      this.setState({
        userId: userInfo.id,
      });
    }
    this.getOrderSummery();
    this.getFinancialSummery();
    this.driverOrderList(this.state.filterType);
    this.getOrderFilter();
  }

  getOrderFilter = () => {
    console.log(`${API_URL}orderFilterParamsForDriver`);
    fetch(`${API_URL}orderFilterParamsForDriver`, {method: 'post'})
      .then((res) => res.json())
      .then((response) => {
        // console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
        console.log(response.types);
        if (response.status) {
          this.setState({
            filters: response.types,
          });
        }
      })
      .catch((err) => {
        console.log('getOrderFilter = ' + err);
        this.setState({contentLoading: false});
      });
  };

  getOrderSummery = () => {
    console.log(`${API_URL}driverOrderSummery`);
    fetch(`${API_URL}driverOrderSummery`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({driver_id: this.state.userId}),
    })
      .then((res) => res.json())
      .then((response) => {
        if (response.status) {
          this.setState({
            orderSummery: response.data,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        this.setState({contentLoading: false});
      });
  };

  driverOrderList = (filterType, removeRecord = false) => {
    let pageNumber = this.state.page;

    console.log(
      `${API_URL}driverOrderList` +
        JSON.stringify({
          user_id: this.state.userId,
          type: filterType,
          page: pageNumber,
        }),
    );
    fetch(`${API_URL}driverOrderList`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: this.state.userId,
        type: filterType,
        page: pageNumber,
      }),
    })
      .then((res) => res.json())
      .then((response) => {
        if (response.status) {
          console.log('############');
          console.log(response.meta);
          this.setState({pageMeta: response.meta, isRefreshing: false});

          LayoutAnimation.configureNext({
            duration: 450,
            create: {
              type: LayoutAnimation.Types.easeInEaseOut,
              property: LayoutAnimation.Properties.opacity,
            },
            update: {type: LayoutAnimation.Types.easeInEaseOut},
          });
          if (response.meta.pages === 0) {
            // alert('if');
            this.setState({
              renderData: [],
              contentLoading: false,
            });
          } else if (pageNumber === response.meta.pages) {
            // alert('innn' + pageNumber + filterType);
            // alert('else if');
            this.setState({
              loadMore: false,
              contentLoading: false,
            });

            if (response.data.length > 0 && removeRecord) {
              // alert('in elseif if');
              this.setState({
                renderData: response.data,
              });
            } else if (response.data.length > 0 && !removeRecord) {
              // alert('in elseif elseif');
              this.setState({
                renderData: this.state.renderData.concat(response.data),
              });
            } else {
              // alert('in elseif else');
              if (removeRecord) {
                this.setState({
                  renderData: [],
                });
              }
            }
          } else {
            if (pageNumber === 1) {
              // alert('else in if');
              // alert(response.meta.total + 'type = ' + orderType);
              this.setState({
                renderData: response.data,
                contentLoading: false,
              });
            } else {
              // alert('else in else');
              if (this.state.pageMeta.pages > 0) {
                this.setState({
                  renderData: this.state.renderData.concat(response.data),
                });
              }
            }
          }
        } else {
          this.setState({
            isRefreshing: false,
          });
          alert('something went wrong!!');
        }
        this.setState({
          filteringRecords: false,
        });
      })
      .catch((err) => {
        console.log(err);
        this.setState({contentLoading: false, filteringRecords: false});
      });
  };

  getFinancialSummery = () => {
    fetch(`${API_URL}driverFinancialSummery`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({driver_id: this.state.userId}),
    })
      .then((res) => res.json())
      .then((response) => {
        // console.log(response);
        if (response.status) {
          this.setState({
            financialSummery: response.data,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        this.setState({contentLoading: false});
      });
  };

  showSnackbar = (message, status = false) => {
    this.setState({
      visible: true,
      success: status,
      message: message,
    });
  };

  onRefresh = () => {
    this.setState(
      {
        isRefreshing: true,
        page: 1,
        loadMore: true,
        filterType: 'all',
        selectedItem: [],
      },
      () => {
        this.getOrderSummery();
        this.getFinancialSummery();
        this.driverOrderList(this.state.filterType, true);
      },
    );
  };

  onMenuPress = (menuId, orderId, type) => {
    console.log(orderId + '=' + menuId + '=' + type);
    if (menuId === 1) {
      if (type === 11) {
        this.setState({
          orderId: orderId,
          isModalVisible: true,
        });
      } else if (type === 8) {
        this.setState({
          orderId: orderId,
          showDatePicker: true,
        });
      }

      // console.log(orderId);
    } else if (menuId === 2) {
      var message = 'You want to perform this operation!';

      if (type === 9) {
        message = 'Customer wants to reject this order!';
      } else if (type === 10) {
        message = 'You want to return the order to HUB!';
      } else if (type === 14) {
        message = 'You want to return the order to merchant!';
      } else if (type === 4) {
        message = 'Customer wants to reject this order!';
      }
      // else {
      //   alert(type);
      // }

      Alert.alert(
        'Are you sure?',
        message,
        [
          {text: 'Cancel', onPress: () => null},
          {
            text: 'OK',
            onPress: () => {
              this.setState({
                showLoading: true,
              });
              this.changeOrderStatus(type, [orderId]);
            },
          },
        ],
        {cancelable: false},
      );

      // this.changeOrderStatus(type, orderId);
    }
  };

  changeOrderStatus = (statusId, orderId) => {
    console.log(
      `${API_URL}updateStatus`,
      JSON.stringify({
        ids: orderId,
        status: statusId,
        user_id: this.state.userId,
      }),
    );
    fetch(`${API_URL}updateStatus`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ids: orderId,
        status: statusId,
        user_id: this.state.userId,
      }),
    })
      .then((res) => res.json())
      .then((response) => {
        console.log(response);

        this.setState({showLoading: false});

        if (response.status) {
          var renderData = [...this.state.renderData];

          orderId.map((id) => {
            if (statusId === 100) {
              let index = renderData.map((item) => item.id).indexOf(id);
              if (index > -1) {
                renderData.splice(index, 1);
              }
            } else {
              console.log(response);
              renderData.map((item) => {
                if (item.id === id) {
                  item.status = response.status;
                  // alert(JSON.stringify(response.actions.statusList));

                  if (response.actions.statusList.length > 0)
                    item.actions[0].statusList = response.actions.statusList;
                  else item.actions = response.actions.statusList;
                  // item.selected = false;
                  // console.log(
                  //   `${API_URL}updateStatus`,
                  //   JSON.stringify({ids: orderId, status: statusId}),
                  // );
                  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                  console.log(item.actions[0].statusList);
                  // console.log(response);
                }
              });
            }
          });

          LayoutAnimation.configureNext({
            duration: 300,
            create: {
              type: LayoutAnimation.Types.easeInEaseOut,
              property: LayoutAnimation.Properties.opacity,
            },
            update: {type: LayoutAnimation.Types.easeInEaseOut},
          });

          if (statusId === 100) {
            this.showSnackbar('Order Deleted Successfully', true);
            this.setState({renderData, selectedItem: []});
          } else {
            this.setState({renderData, selectedItem: [], blinkIds: orderId});
            setTimeout(() => {
              this.setState({
                blinkIds: [],
              });
            }, 5000);
            this.showSnackbar('Order Status Changed Successfully', true);
          }
        } else {
          this.showSnackbar(response.status_text);
        }
      })
      .catch((err) => {
        console.log(err);
        this.setState({showLoading: false});
      });
  };

  changeStatusSuccess = (orderId) => {
    var renderData = [...this.state.renderData];

    renderData.map((item) => {
      if (item.id === orderId) {
        item.status = {
          id: 11,
          name: 'Delivered',
          color: 'brand',
        };

        item.actions = [];
      }
    });

    LayoutAnimation.configureNext({
      duration: 500,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {type: LayoutAnimation.Types.easeInEaseOut},
    });

    this.showSnackbar('Order Delivered Successfully', true);
    this.setState({renderData});
  };

  // onActionPress = async () => {
  //   var selectedOrderStatus = [];
  //   var actions = [];

  //   if (this.state.selectedItem.length > 0) {
  //     this.state.selectedItem.map((id) => {
  //       var value = this.state.renderData.find((x) => x.id === id);
  //       selectedOrderStatus = [...selectedOrderStatus, value.status.id];
  //       actions = value.actions;
  //     });

  //     // console.log(selectedOrderStatus);
  //     if (new Set(selectedOrderStatus).size === 1) {
  //       return {status: true, actions: actions};
  //     } else {
  //       this.showSnackbar('Please select order with same status');
  //       return {status: false, actions: []};
  //     }
  //   }
  // };

  // onDeletePress = () => {
  //   Alert.alert(
  //     'Are you sure?',
  //     'You want to delete this order.',
  //     [
  //       {text: 'Cancel', onPress: () => null},
  //       {
  //         text: 'OK',
  //         onPress: () => {
  //           this.setState({
  //             showLoading: true,
  //           });
  //           console.log(
  //             `${API_URL}deleteOrder`,
  //             JSON.stringify({ids: this.state.selectedItem}),
  //           );
  //           fetch(`${API_URL}deleteOrder`, {
  //             method: 'POST',
  //             headers: {
  //               Accept: 'application/json',
  //               'Content-Type': 'application/json',
  //             },
  //             body: JSON.stringify({ids: this.state.selectedItem}),
  //           })
  //             .then((res) => res.json())
  //             .then((response) => {
  //               this.setState({showLoading: false});
  //               console.log(response);
  //               console.log('_________remove ids___________');
  //               console.log(response.ids);

  //               if (response.ids.length > 0) {
  //                 var orders = this.state.renderData;

  //                 response.ids.map((item) => {
  //                   orders.splice(
  //                     orders.findIndex((a) => a.id === item),
  //                     1,
  //                   );
  //                 });

  //                 console.log('############################################');
  //                 console.log(orders);
  //                 this.setState({
  //                   renderData: orders,
  //                 });
  //               }

  //               if (response.status) {
  //                 this.setState({
  //                   selectedItem: [],
  //                 });

  //                 this.showSnackbar(response.status_text, true);
  //               } else {
  //                 this.showSnackbar(response.status_text);
  //               }
  //             })
  //             .catch((err) => {
  //               console.log(err);
  //               this.setState({showLoading: false});
  //             });
  //         },
  //       },
  //     ],
  //     {cancelable: false},
  //   );
  // };

  onEndReached = () => {
    let newPage = this.state.page + 1;
    if (newPage <= this.state.pageMeta.pages) {
      this.setState(
        {
          page: newPage,
        },
        () => this.driverOrderList(this.state.filterType),
      );
    } else {
      this.setState({
        loadMore: false,
      });
    }
  };

  render() {
    // const param = this.props.route.params;
    // if (param !== undefined) {
    //   if (param.screen !== undefined) {
    //     this.showSnackbar(param.message, param.status);

    //     this.setState(
    //       {
    //         page: 1,
    //         loadMore: true,
    //         selectedItem: [],
    //       },
    //       () => {
    //         this.getOrderSummery();
    //         this.driverOrderList(this.state.filterType, true);
    //       },
    //     );

    //     param.screen = undefined;
    //   }
    // }

    const ContentLoader = () => {
      const array = [0, 1, 2, 3, 4, 5];
      return (
        <View style={{flex: 1, backgroundColor: colors.backgroundColor}}>
          <SkeletonPlaceholder backgroundColor={colors.cardColor}>
            <View style={{height: 130}} />
            <View style={{paddingHorizontal: 10, marginTop: 20}}>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                }}>
                {array.map((i) => (
                  <View style={styles.imageBox} key={i}>
                    <View style={styles._imageIcon}>
                      <View style={{width: '70%', justifyContent: 'center'}} />
                    </View>
                  </View>
                ))}
              </View>
              <View style={{marginTop: 10}}>
                <View style={styles.cardStyle} />
                <View style={styles.cardStyle} />
                <View style={styles.cardStyle} />
              </View>
            </View>
          </SkeletonPlaceholder>
        </View>
      );
    };

    const {financialSummery, orderSummery, renderData, filters} = this.state;
    const {colors} = this.props;
    return (
      <>
        {/* {this.state.selectedItem.length > 0 ? (
          <Header
            title={this.state.selectedItem.length + ' Orders Selected'}
            back={true}
            goBack={() => {
              this.state.renderData.map((a) => (a.selected = false));
              this.setState({selectedItem: []});
            }}
            hideNotification={true}
            selected={true}
            onDeletePress={() => this.onDeletePress()}
            onActionPress={() => this.onActionPress()}
            onMenuPress={(mid, type = '') =>
              this.onMenuPress(mid, this.state.selectedItem, type)
            }
          />
        ) : ( */}
        <Header title="Dashboard" />
        {/* )} */}
        <>
          {this.state.contentLoading ? (
            <ContentLoader />
          ) : (
            <View style={styles.container(colors.backgroundColor)}>
              <AnimatedPullToRefresh
                isRefreshing={this.state.isRefreshing}
                onRefresh={this.onRefresh}
                pullHeight={10 * vh}
                backgroundColor={'#5DADE2'}
                renderElement={
                  <ScrollView>
                    <View style={{backgroundColor: colors.backgroundColor}}>
                      <InputOTP
                        visible={this.state.isModalVisible}
                        colors={colors}
                        orderId={this.state.orderId}
                        userId={this.state.userId}
                        onClosePress={() =>
                          this.setState({
                            isModalVisible: false,
                          })
                        }
                        changeStatusSuccess={this.changeStatusSuccess}
                        clear={true}
                      />
                      {this.state.showDatePicker && (
                        <DateTimePicker
                          testID="dateTimePicker"
                          value={this.state.date}
                          minimumDate={new Date()}
                          mode={this.state.mode}
                          is24Hour={true}
                          display="default"
                          onChange={this.onDateChange}
                          timeZoneOffsetInMinutes={0}
                        />
                      )}
                    </View>
                    {financialSummery && (
                      <View style={styles.moneyText}>
                        {Object.keys(financialSummery).map((key, i) => {
                          var right = i % 2 === 0 ? true : false;
                          return right ? (
                            <View
                              style={{
                                width: '55%',
                                marginBottom: 10,
                              }}>
                              <Text style={styles.headingText}>
                                {financialSummery[key].text}
                              </Text>
                              <Text style={styles.headingText}>
                                {this.props.currency}
                                {financialSummery[key].number}
                              </Text>
                            </View>
                          ) : (
                            <View
                              style={{
                                width: '45%',
                                marginBottom: 10,
                                alignItems: 'flex-end',
                              }}>
                              <View>
                                <Text style={styles.headingText}>
                                  {financialSummery[key].text}
                                </Text>
                                <Text style={styles.headingText}>
                                  {this.props.currency}
                                  {financialSummery[key].number}
                                </Text>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    )}

                    <View
                      style={{
                        paddingHorizontal: 10,
                        marginTop: 20,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                        }}>
                        {Object.keys(orderSummery).map((key, i) => {
                          // var right = i % 2 === 0 ? true : false;
                          let gradient = [
                            orderSummery[key].bgColor,
                            orderSummery[key].bgColor,
                          ];
                          // if (i === 0) {
                          //   gradient = ['#E3774A', '#FC8437', '#FEA237'];
                          // } else if (i === 1) {
                          //   gradient = ['#a2b346', '#96a159', '#b1bd73'];
                          // } else if (i === 2) {
                          //   gradient = ['#2EB62C', '#57C84D', '#83D475'];
                          // } else if (i === 3) {
                          //   gradient = ['#0000FF', '#1F1FFF', '#4949FF'];
                          // } else if (i === 4) {
                          //   gradient = ['#FBB034', '#FFD400', '#FFDD00'];
                          // } else if (i == 5) {
                          //   gradient = ['#DC1C13', '#EA4C46', '#F07470'];
                          // }

                          // return right ? (
                          return (
                            <Ripple
                              style={styles.imageBox}
                              onPress={() =>
                                this.setState(
                                  {
                                    filteringRecords: true,
                                    page: 1,
                                    loadMore: true,
                                    filterType: orderSummery[key].index,
                                  },
                                  () => {
                                    this.driverOrderList(
                                      orderSummery[key].index,
                                      true,
                                    );
                                  },
                                )
                              }>
                              <LinearGradient
                                colors={gradient}
                                style={styles._imageIcon}>
                                <View
                                  style={{
                                    width: '30%',
                                  }}>
                                  <Image
                                    source={{uri: orderSummery[key].icon}}
                                    style={styles._image}
                                    resizeMode={'contain'}
                                  />
                                </View>
                                <View
                                  style={{
                                    width: '70%',
                                    justifyContent: 'center',
                                  }}>
                                  <Text style={styles._imageText}>
                                    {orderSummery[key].text}
                                  </Text>
                                  <Text style={styles._imageText}>
                                    {orderSummery[key].number}
                                  </Text>
                                </View>
                              </LinearGradient>
                            </Ripple>
                          );
                        })}
                      </View>
                    </View>
                    <View style={{marginVertical: 10}}>
                      <View
                        style={{flexDirection: 'row', paddingHorizontal: 15}}>
                        <Title
                          style={{
                            color: colors.textLight,
                            textAlignVertical: 'center',
                          }}>
                          Total {this.state.pageMeta.total ?? '0'} Records
                        </Title>
                        <View style={{marginLeft: 'auto'}}>
                          {this.state.filteringRecords ? (
                            <ActivityIndicator
                              size={30}
                              color={colors.primaryColor}
                            />
                          ) : (
                            <Menu
                              ref={this.setMenuRef}
                              style={{backgroundColor: colors.secondaryColor}}
                              button={
                                <TouchableRipple
                                  onPress={this.showMenu}
                                  borderless={true}
                                  centered={true}
                                  style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    margin: 6,
                                    width: 30 * 1.2,
                                    height: 30 * 1.2,
                                    borderRadius: (30 * 1.2) / 2,
                                  }}
                                  rippleColor="rgba(0, 0, 0, .32)">
                                  <Icon
                                    size={30}
                                    name="filter-variant"
                                    color={colors.textLight}
                                  />
                                </TouchableRipple>
                              }>
                              {Object.keys(filters).map((key, i) => {
                                return (
                                  <MenuItem
                                    onPress={() => {
                                      this.setState(
                                        {
                                          filteringRecords: true,
                                          page: 1,
                                          loadMore: true,
                                          filterType: key,
                                          selectedItem: [],
                                        },
                                        () => {
                                          this.driverOrderList(
                                            this.state.filterType,
                                            true,
                                          );
                                        },
                                      );
                                      this._menu.hide();
                                    }}>
                                    <Text style={{color: colors.textLight}}>
                                      {filters[key]}
                                    </Text>
                                  </MenuItem>
                                );
                              })}
                            </Menu>
                          )}
                        </View>
                      </View>
                      {renderData.length > 0 ? (
                        <>
                          <View>
                            <FlatList
                              nestedScrollEnabled={true}
                              data={renderData}
                              keyExtractor={(item) => item.id.toString()}
                              ListFooterComponent={
                                this.state.loadMore ? (
                                  <ActivityIndicator
                                    color={colors.primaryColor}
                                    size="large"
                                  />
                                ) : null
                              }
                              onEndReached={() => this.onEndReached()}
                              onEndReachedThreshold={10}
                              renderItem={({item}) => (
                                <View
                                  style={{
                                    backgroundColor: colors.backgroundColor,
                                  }}>
                                  <Accordian
                                    style={
                                      item.selected == true
                                        ? {opacity: 0.7}
                                        : this.state.blinkIds.indexOf(
                                            item.id,
                                          ) != -1
                                        ? {backgroundColor: '#f8d7da'}
                                        : {backgroundColor: colors.cardColor}
                                    }
                                    // activeColor={
                                    //   this.state.activeColor ?? colors.cardColor
                                    // }
                                    // orderNumber={item.number}
                                    // actions={item.actions}
                                    dataItem={item}
                                    currency={this.props.currency}
                                    // statusChanged={true}
                                    status="pending"
                                    onMenuPress={(mid, type = '') => {
                                      // let id = mid === 1 ? item.id : [item.id];
                                      this.onMenuPress(mid, item.id, type);
                                    }}
                                  />
                                </View>
                              )}
                            />
                          </View>
                        </>
                      ) : (
                        <View
                          style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <LottieView
                            source={DeliveryMan}
                            style={{
                              height: Dimensions.get('window').height / 3.2,
                            }}
                            autoPlay
                            loop
                          />
                          <Text style={{color: colors.textLight, fontSize: 17}}>
                            No Orders Found
                          </Text>
                        </View>
                      )}
                    </View>
                    {/* <Accordian title="Mitesh" data="card 1" status="pending" />
            <Accordian title="Mitesh" data="card 2" status="success" />
            <Accordian title="Mitesh" data="card 3" status="pending" />
            <Accordian title="Mitesh" data="card 4" status="delayed" />
            <Accordian title="Mitesh" data="card 5" status="dispatched" /> */}
                  </ScrollView>
                }
                pullAnimationSource={rocketAnim}
                startRefreshAnimationSource={rocketAnim}
                refreshAnimationSource={shippingTruck}
                endRefreshAnimationSource={shippingTruck}
              />
            </View>
          )}
        </>
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
        {this.state.showLoading && <Loader color={colors.primaryColor} />}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  let brand = state.brand;
  // alert(brand.currency);

  let currency = '৳';

  console.log(brand);

  if (brand !== null) {
    brand = JSON.parse(brand);
    currency = brand.currency;
  }

  var theme = getThemeColors(state.theme);
  return {colors: theme, currency: currency};
};

export default connect(mapStateToProps)(Dashboard);

const styles = StyleSheet.create({
  container: (bgColor) => ({
    flex: 1,
    backgroundColor: bgColor,
  }),
  _imageIcon: {
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
    paddingLeft: 5,
    paddingVertical: 10,
    // elevation: 2,
    flexDirection: 'row',
    height: 80,
    width: '96%',
  },
  _imageText: {
    // backgroundColor: 'yellow',
    paddingTop: 5,
    color: '#fff',
    fontSize: 16,
    opacity: 0.97,
  },
  _image: {
    height: 50,
    width: 45,
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  imageBox: {
    width: '50%',
    justifyContent: 'center',
    elevation: 10,
    // alignItems: 'center',
    // borderRightWidth: 1,
    // borderRightColor: '#ccc',
    marginBottom: 10,
    // backgroundColor: 'red',
  },
  headingText: {
    fontSize: 20,
    color: '#fff',
  },
  moneyText: {
    flexDirection: 'row',
    backgroundColor: '#140C5F',
    paddingHorizontal: 15,
    paddingVertical: 7,
    flexWrap: 'wrap',
  },
  cardStyle: {
    margin: 5,
    borderRadius: 15,
    height: 100,
  },
});

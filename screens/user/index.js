import * as React from 'react';
import {StyleSheet, View, Text, ScrollView} from 'react-native';
import StepIndicator from 'react-native-step-indicator';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SplashScreen from 'react-native-splash-screen';
import {colors, getThemeColors} from '../../global/themes';
import {Snackbar} from 'react-native-paper';
import {API_URL} from '../../global/config';
import Header from '../common/Header';
import AsyncStorage from '@react-native-community/async-storage';
import {BankingInfo, CompanyInfo, PersonalInfo, PickupInfo} from './info';
import {connect} from 'react-redux';
import {setProfileStatus} from '../../redux/actions/config';

// const getStepIndicatorIconConfig = ({position, stepStatus, primaryColor}) => {
//   const iconConfig = {
//     name: 'emoticon-happy',
//     color: stepStatus === 'finished' ? '#ffffff' : primaryColor,
//     size: 23,
//   };
//   switch (position) {
//     case 0: {
//       iconConfig.name = 'account-outline';
//       break;
//     }
//     case 1: {
//       iconConfig.name = 'home-city-outline';
//       break;
//     }
//     case 2: {
//       iconConfig.name = 'credit-card-outline';
//       break;
//     }
//     case 3: {
//       iconConfig.name = 'map-marker-outline';
//       break;
//     }
//     default: {
//       break;
//     }
//   }
//   return iconConfig;
// };

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 0,
      userId: '',
      message: '',
      visible: false,
      success: false,
      stepArray: {
        labels: [
          'Personal Information',
          'Banking Information',
          'Company Information',
          'Pickup Location',
        ],
        keys: ['personal_info', 'banking_info', 'company_info', 'pickup_info'],
        icons: [
          'account-outline',
          'credit-card-outline',
          'home-city-outline',
          'map-marker-outline',
        ],
      },
      currentPageName: 'personal_info',
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

    // alert(this.props.route);
    this.fetchStepData();
  };

  fetchStepData = () => {
    let requestData = JSON.stringify({
      merchant_id: this.state.userId,
    });

    console.log(`${API_URL}merchantProfileCompletionSteps` + requestData);
    fetch(`${API_URL}merchantProfileCompletionSteps`)
      .then((res) => res.json())
      .then((response) => {
        console.log(response);
        this.setState({loading: false});
        if (response.status) {
          this.setState(
            {
              stepArray: response.steps,
              currentPageName: response.steps.keys[0],
            },
            () => {
              if (this.props.route.params === undefined) {
                this.getUserStatus();
              }
            },
          );
        }
      })
      .catch((err) => {
        console.log('merchantProfileCompletionSteps ' + err);
        this.setState({loading: false});
      });
  };

  showSnackbar = (message, status = false) => {
    this.setState({
      visible: true,
      success: status,
      message: message,
    });
  };

  getPersonalInfo = (options, response, redirect = false) => {
    fetch(`${API_URL}getUserPersonalInfo`, options)
      .then((res) => res.json())
      .then((res) => {
        const {data} = res;
        response.imageUri = data.avatar;
        response.email = data.email;
        response.username = data.username;

        // console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
        // console.log(response);

        // alert(JSON.stringify(response));

        this.props.setStatus(JSON.stringify(response));
        AsyncStorage.setItem('profileStatus', JSON.stringify(response));
        if (redirect) {
          this.props.navigation.reset({
            index: 0,
            routes: [{name: 'Dashboard'}],
          });
        }
      })
      .catch((err) => {
        console.log('getUserPersonalInfo ' + err);
      });
  };

  getUserStatus = () => {
    let requestData = JSON.stringify({
      merchant_id: this.state.userId,
      user_id: this.state.userId,
    });

    let options = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: requestData,
    };

    console.log(`${API_URL}merchantProfileCompeletionAction` + requestData);
    fetch(`${API_URL}merchantProfileCompeletionAction`, options)
      .then((res) => res.json())
      .then((response) => {
        // console.log(response);
        this.setState({loading: false});
        let type = response.type;

        if (type) {
          type = type - 1;
          let status = this.state.stepArray.keys[type];
          console.log(status + ' + type + ' + type + ' = ' + response.helpText);
          this.showSnackbar(response.helpText);
          this.setState(
            {
              currentPage: type,
              currentPageName: status,
            },
            () => {
              this.displayStepData();
            },
          );
          this.getPersonalInfo(options, response);
          SplashScreen.hide();
        } else {
          this.getPersonalInfo(options, response, true);
        }
      })
      .catch((err) => {
        console.log(err);
        SplashScreen.hide();
        this.setState({loading: false});
      });
  };

  goToNextStep = (complete = 'NOT_COMPLETED') => {
    if (complete === 'COMPLETED') {
      // alert('in');
      this.getUserStatus();
    } else {
      let status =
        this.state.stepArray.keys.indexOf(this.state.currentPageName) + 1;

      this.setState(
        {
          currentPage: status,
          currentPageName: this.state.stepArray.keys[status],
        },
        () => {
          this.displayStepData();
        },
      );
    }
  };

  displayStepData = () => {
    console.log(this.state.currentPageName);
    // company_info', 'personal_info', 'banking_info', 'pickup_info
    if (this.state.currentPageName === 'personal_info') {
      return (
        <PersonalInfo
          showSnackbar={(message, status) => this.showSnackbar(message, status)}
          goToNextStep={() => this.goToNextStep()}
          colors={this.props.colors}
          imagePlaceholder={this.props.imagePlaceholder}
        />
      );
    } else if (this.state.currentPageName === 'company_info') {
      return (
        <CompanyInfo
          showSnackbar={(message, status) => this.showSnackbar(message, status)}
          goToNextStep={() => this.goToNextStep()}
          colors={this.props.colors}
          imagePlaceholder={this.props.imagePlaceholder}
        />
      );
    } else if (this.state.currentPageName === 'banking_info') {
      return (
        <BankingInfo
          showSnackbar={(message, status) => this.showSnackbar(message, status)}
          goToNextStep={() => this.goToNextStep()}
          colors={this.props.colors}
        />
      );
    } else {
      return (
        <PickupInfo
          showSnackbar={(message, status) => this.showSnackbar(message, status)}
          goToNextStep={() => this.goToNextStep('COMPLETED')}
          colors={this.props.colors}
        />
      );
    }
  };

  render() {
    const {colors} = this.props;
    const indicatorStyles = {
      stepIndicatorSize: 40,
      currentStepIndicatorSize: 50,
      separatorStrokeWidth: 2,
      currentStepStrokeWidth: 3,
      stepStrokeCurrentColor: colors.primaryColor,
      stepStrokeWidth: 3,
      separatorStrokeFinishedWidth: 3,
      stepStrokeFinishedColor: colors.primaryColor,
      stepStrokeUnFinishedColor: '#aaaaaa',
      separatorFinishedColor: colors.primaryColor,
      separatorUnFinishedColor: '#aaaaaa',
      stepIndicatorFinishedColor: colors.primaryColor,
      stepIndicatorUnFinishedColor: colors.secondaryColor,
      stepIndicatorCurrentColor: colors.secondaryColor,
      stepIndicatorLabelFontSize: 13,
      currentStepIndicatorLabelFontSize: 13,
      stepIndicatorLabelCurrentColor: colors.primaryColor,
      stepIndicatorLabelFinishedColor: colors.secondaryColor,
      stepIndicatorLabelUnFinishedColor: '#aaaaaa',
      labelColor: '#999999',
      labelSize: 13,
      currentStepLabelColor: colors.primaryColor,
    };

    const onStepPress = (position) => {
      // alert(position);
      this.setState({
        currentPage: position,
        currentPageName: this.state.stepArray.keys[position],
      });
    };

    const renderStepIndicator = (params) => {
      // params.primaryColor = colors.primaryColor;

      const iconConfig = {
        name: this.state.stepArray.icons[params.position],
        color:
          params.stepStatus === 'finished' ? '#ffffff' : colors.primaryColor,
        size: 23,
      };

      // return <MaterialIcons {...getStepIndicatorIconConfig(params)} />;
      return <MaterialIcons {...iconConfig} />;
    };

    return (
      <>
        <ScrollView
          style={styles.container(colors.backgroundColor)}
          keyboardShouldPersistTaps="always">
          <Header title="Complete Profile" hideNotification={true} />
          <View style={styles.stepIndicator}>
            <StepIndicator
              customStyles={indicatorStyles}
              currentPosition={this.state.currentPage}
              onPress={(position) => onStepPress(position)}
              stepCount={4}
              renderStepIndicator={renderStepIndicator}
              labels={this.state.stepArray.labels}
            />
            <View style={{marginVertical: 15, paddingHorizontal: 15}}>
              {this.displayStepData()}
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
      </>
    );
  }
}

const mapStateToProps = (state) => {
  // alert(state.brand.default.avatar);
  // console.log('!!!!!!!!!!!!!!!!!!!!');

  let imagePlaceholder = JSON.parse(state.brand);

  if (imagePlaceholder !== null) {
    imagePlaceholder = imagePlaceholder.default.image_placeholder;
  } else {
    imagePlaceholder = '';
  }

  var theme = getThemeColors(state.theme, state.brand);
  return {colors: theme, imagePlaceholder: imagePlaceholder};
};

export default connect(mapStateToProps, {
  setStatus: setProfileStatus,
})(Index);

const styles = StyleSheet.create({
  container: (bgColor) => ({
    flex: 1,
    backgroundColor: bgColor,
  }),
  stepIndicator: {
    marginTop: 15,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // stepLabel: {
  //   fontSize: 12,
  //   textAlign: 'center',
  //   fontWeight: '500',
  //   color: '#999999',
  // },
  // stepLabelSelected: {
  //   fontSize: 12,
  //   textAlign: 'center',
  //   fontWeight: '500',
  //   color: '#4aae4f',
  // },
});

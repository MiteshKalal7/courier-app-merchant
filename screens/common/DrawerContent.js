import React from 'react';
import {View, StyleSheet, Alert, Text, ActivityIndicator} from 'react-native';
import {
  Avatar,
  Title,
  Caption,
  Drawer,
  TouchableRipple,
  Divider,
  Switch,
} from 'react-native-paper';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import AsyncStorage from '@react-native-community/async-storage';
import {connect} from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {setTheme} from './../../redux/actions/config';
import {getThemeColors} from '../../global/themes';
import {API_URL} from './../../global/config';
import { Linking } from 'react-native';
// import {bindActionCreators} from 'redux';

var pkg = require('./../../package.json');

function DrawerContent(props) {
  const [loading, setLoading] = React.useState(false);
  const [profileStatus, setProfileStatus] = React.useState({});
  // const [isDarkMode, setIsDarkMode] = React.useState(false);

  let userInfo = props.data;

  const logout = () => {
    Alert.alert(
      'Are you sure?',
      'You want to Logout',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            setLoading(true);
            console.log(`${API_URL}disableDevice`);
            fetch(`${API_URL}disableDevice`, {
              method: 'post',
              body: JSON.stringify({user_id: userInfo.id}),
            })
              .then((res) => res.json())
              .then(async (res) => {
                if (!res.status) {
                  setLoading(false);
                  alert('something went wrong!!');
                } else {
                  try {
                    await AsyncStorage.removeItem('userInfo');
                    await AsyncStorage.removeItem('profileStatus');

                    props.navigation.reset({
                      index: 0,
                      routes: [{name: 'Login'}],
                    });
                  } catch (exception) {
                    setLoading(false);
                    return false;
                  }
                }
              })
              .catch((e) => {
                setLoading(false);
                console.log(e);
              });
          },
        },
      ],
      {cancelable: false},
    );
  };

  const onThemeChange = async () => {
    AsyncStorage.setItem(
      'themeMode',
      props.theme === 'default' ? 'dark' : 'default',
    );
    props.onSelectTheme(props.theme === 'default' ? 'dark' : 'default');

    fetch(`${API_URL}toggleDarkMode`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userInfo.id,
        dark_mode: props.theme === 'default' ? 1 : 0,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const {colors} = props;

  React.useEffect(() => {
    var profileStatus = props.profileStatus;

    if (profileStatus) {
      profileStatus = JSON.parse(profileStatus);

      setProfileStatus(profileStatus);
    }
  }, [props.profileStatus]);

  return (
    <>
      <View style={{flex: 1, backgroundColor: colors.drawerBackground}}>
        <DrawerContentScrollView {...props}>
          <View style={styles.drawerContent}>
            <TouchableRipple
              style={styles.userInfoSection}
              onPress={() =>
                props.navigation.navigate('ProfileStep', {status: 'TRUE'})
              }
              rippleColor="rgba(0, 0, 0, .32)">
              <View style={{flexDirection: 'row'}}>
                <Avatar.Image
                  source={{
                    uri: profileStatus.imageUri ?? props.imagePlaceholder,
                  }}
                  size={50}
                />
                <View style={{marginLeft: 15, flexDirection: 'column'}}>
                  <Title style={styles.title(colors.textColor)}>
                    {profileStatus.username ?? userInfo.name}
                  </Title>
                  <Caption style={styles.caption(colors.textColor)}>
                    {profileStatus.email ?? userInfo.email}
                  </Caption>
                </View>
                <View
                  style={{
                    justifyContent: 'center',
                    marginLeft: 'auto',
                    paddingRight: 7,
                  }}>
                  <Icon
                    name="account-edit"
                    size={25}
                    color={colors.textColor}
                  />
                </View>
              </View>
            </TouchableRipple>
            <Divider />

            <Drawer.Section style={styles.drawerSection}>
              <DrawerItem
                icon={() => (
                  <Icon name="home" size={30} color={colors.textColor} />
                )}
                labelStyle={{color: colors.textColor}}
                label="Home"
                onPress={() => {
                  if (profileStatus.type || profileStatus.type === undefined) {
                    alert('Complete Your profile first');
                  } else {
                    props.navigation.navigate('Dashboard');
                  }
                }}
              />
              <DrawerItem
                icon={() => (
                  <Icon
                    name="text-box-plus"
                    size={30}
                    color={colors.textColor}
                  />
                )}
                label="Shipment"
                labelStyle={{color: colors.textColor}}
                onPress={() => {
                  if (profileStatus.type || profileStatus.type === undefined) {
                    alert('Complete Your profile first');
                  } else {
                    props.navigation.navigate('Shipment');
                  }
                }}
              />
              {/* <DrawerItem
                icon={() => (
                  <Icon name="cog" size={30} color={colors.textColor} />
                )}
                label="Settings"
                labelStyle={{color: colors.textColor}}
                onPress={() => {
                  console.log('settings');
                }}
              /> */}
            </Drawer.Section>
            <Drawer.Section
              title={
                <Text style={{color: colors.textColor}}>Preferences</Text>
              }>
              <TouchableRipple onPress={() => onThemeChange()}>
                <View style={styles.preference}>
                  <Text style={{color: colors.textColor}}>Dark Theme</Text>
                  <View>
                    <Switch
                      value={props.theme === 'dark' ? true : false}
                      onValueChange={() => onThemeChange()}
                    />
                  </View>
                </View>
              </TouchableRipple>
            </Drawer.Section>
          </View>
        </DrawerContentScrollView>
        
        <View
          style={{
              flexDirection: 'row',
              marginBottom: 5,
              justifyContent: 'center',
            }}>
          <Text
            style={{
              color: colors.textColor,
              textAlign: 'center',
            }}>
            Developed by:
          </Text>
          <TouchableRipple
            style={{
              marginBottom: 'auto',
            }}
            onPress={() => {
              Linking.openURL('https://itscholarbd.com');
            }}>
            <Text style={{color: '#78A3E8'}}> ITscholarBD</Text>
          </TouchableRipple>
        </View>
        <Drawer.Section style={styles.bottomDrawerSection}>
          <DrawerItem
            style={{paddingBottom: 0}}
            icon={() =>
              loading ? (
                <ActivityIndicator size={30} color={colors.primaryColor} />
              ) : (
                <Icon name="exit-to-app" size={30} color={colors.textColor} />
              )
            }
            label={'Logout'}
            labelStyle={{color: colors.textColor}}
            onPress={() => logout()}
          />
        </Drawer.Section>
        <View
          style={{
            marginBottom: 5,
            alignItems: 'center',
          }}>
          <Text style={{opacity: 0.8, color: colors.textColor}}>
            V - {pkg.version}
          </Text>
        </View>
      </View>
    </>
  );
}

// const mapDispatchToProps = dispatch => ({
//   onSelectTheme: bindActionCreators(ActionCreators, dispatch),
// });
// export default DrawerContent;

const mapStateToProps = (state) => {
  // console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
  // console.log(state);
  // alert(JSON.stringify(state));
  // setIsDarkMode(state.theme === 'dark' ? true : false);

  let imagePlaceholder = JSON.parse(state.brand);

  if (imagePlaceholder) {
    imagePlaceholder = imagePlaceholder.default.avatar;
  } else {
    imagePlaceholder = '';
  }

  var theme = getThemeColors(state.theme);
  return {
    theme: state.theme,
    colors: theme,
    profileStatus: state.profileStatus,
    imagePlaceholder: imagePlaceholder,
  };

  // count: state.count,
};

export default connect(mapStateToProps, {
  onSelectTheme: setTheme,
})(DrawerContent);
//

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
    paddingVertical: 10,
  },
  title: (color) => ({
    fontSize: 16,
    marginTop: 3,
    fontWeight: 'bold',
    color: color,
  }),
  caption: (color) => ({
    fontSize: 14,
    lineHeight: 14,
    opacity: 0.8,
    color: color,
  }),
  row: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  paragraph: {
    fontWeight: 'bold',
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 15,
  },
  bottomDrawerSection: {
    // marginBottom: 15,
    borderTopColor: '#ccc',
    borderTopWidth: 0.2,
    borderBottomColor: '#ccc',
    borderBottomWidth: 0.2,
  },
  preference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 20,
    paddingTop: 20,
    fontWeight: 'bold',
  },
});

import React from 'react';
import {
  // StyleSheet,
  // TouchableOpacity,
  // TouchableWithoutFeedback,
  Text,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Appbar, Badge} from 'react-native-paper';
// import {colors} from '../../global/themes';
import {connect} from 'react-redux';
import {setTheme} from './../../redux/actions/config';
// import {bindActionCreators} from 'redux';
import {getThemeColors} from '../../global/themes';
// import {useState} from 'react';
import {API_URL} from '../../global/config';
import AsyncStorage from '@react-native-community/async-storage';
import Menu, {MenuItem, MenuDivider} from 'react-native-material-menu';

const ContentTitle = ({title, color}) => (
  <Appbar.Content
    title={
      // <View style={{zIndex: 99999999}}>
      <Text style={{fontSize: 20, color: color, zIndex: 99999999}}>
        {' '}
        {title}{' '}
      </Text>
      // </View>
    }
    style={{marginLeft: -10}}
  />
);

function Header(props) {
  const navigation = useNavigation();

  const {colors} = props;

  const [notificationCount, setNotificationCount] = React.useState(0);
  const [showMenu, setShowMenu] = React.useState(false);
  const [actions, setActions] = React.useState([]);
  const menu = React.useRef();

  const hideMenu = () => menu.current.hide();

  const getUserId = async () => {
    let userInfo = await AsyncStorage.getItem('userInfo');
    if (userInfo) {
      userInfo = JSON.parse(userInfo);
      return userInfo.id;
    }
  };

  React.useEffect(() => {
    if (showMenu) {
      menu.current.show();
    }
  }, [showMenu]);

  React.useEffect(() => {
    getUserId().then((id) => {
      fetch(`${API_URL}newNotification`, {
        method: 'post',
        body: JSON.stringify({user_id: id}),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.status) {
            setNotificationCount(res.notification_count);
          }
        })
        .catch((e) => {
          console.log(e);
        });
    });
  }, []);

  return (
    <Appbar.Header style={{backgroundColor: colors.headerColor}}>
      {props.back ? (
        <Appbar.BackAction
          onPress={() => (props.goBack ? props.goBack() : navigation.goBack())}
        />
      ) : (
        <Appbar.Action
          icon="menu"
          onPress={() => navigation.openDrawer()}
          size={28}
          color={colors.textColor}
          style={{paddingLeft: 3}}
        />
      )}

      <ContentTitle title={props.title} color={colors.textColor} />
      {!props.hideNotification && (
        <View>
          {notificationCount > 0 && (
            <Badge
              visible={true}
              size={16}
              style={{position: 'absolute', top: 10, right: 7, zIndex: 9999}}>
              <Text style={{fontSize: 12}}>{notificationCount}</Text>
            </Badge>
          )}

          <Appbar.Action
            icon="bell"
            onPress={() => {
              setNotificationCount(0);
              navigation.navigate('Notifications');
            }}
            size={28}
            color={colors.textColor}
            style={{paddingLeft: 3}}
          />
        </View>
      )}
      {props.selected && (
        <>
          <Appbar.Action
            icon="delete"
            onPress={() => props.onDeletePress()}
            size={28}
            color={colors.textColor}
            style={{left: 10}}
          />
          <Menu
            ref={menu}
            style={{backgroundColor: colors.secondaryColor}}
            onHidden={() => {
              setShowMenu(false);
            }}
            button={
              <Appbar.Action
                icon="dots-vertical"
                onPress={() => {
                  props.onActionPress().then((res) => {
                    console.log(res);
                    // if (res.status === 'TRUE') {
                    setShowMenu(res.status);
                    setActions(res.actions);
                    // } else {
                    //   setShowMenu(false);
                    // }
                  });
                }}
                size={28}
                color={colors.textColor}
              />
            }>
            {actions.length > 0 &&
              actions.map((item, i) => {
                return (
                  <>
                    {item.statusList !== undefined && (
                      <>
                        <MenuItem style={{height: 40}} disabled>
                          <Text style={{color: colors.textLight}}>
                            {item.text}
                          </Text>
                        </MenuItem>
                        {item.statusList.map((list) => {
                          return (
                            <MenuItem
                              onPress={() => {
                                props.onMenuPress(item.type, list.VALUE);
                                menu.current.hide();
                              }}
                              key={i}>
                              <Text style={{color: colors.textColor}}>
                                {' '}
                                {list.LABEL}
                              </Text>
                            </MenuItem>
                          );
                        })}
                      </>
                    )}
                  </>
                );
              })}
          </Menu>
        </>
      )}
    </Appbar.Header>
  );
}

const mapStateToProps = (state) => {
  var theme = getThemeColors(state.theme);
  return {colors: theme};
};

export default connect(mapStateToProps, {
  onSelectTheme: setTheme,
})(Header);

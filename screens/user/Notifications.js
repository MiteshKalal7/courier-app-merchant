import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import Header from '../common/Header';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {ScrollView} from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage';
import {API_URL} from '../../global/config';
import {connect} from 'react-redux';
import {getThemeColors} from '../../global/themes';
import NoNotifications from './../common/notifications.json';
import LottieView from 'lottie-react-native';

class Notifications extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notifications: [],
      page: 1,
      contentLoading: true,
      pageMeta: {},
      loadMore: true,
    };
  }

  async componentDidMount() {
    let userInfo = await AsyncStorage.getItem('userInfo');
    if (userInfo) {
      userInfo = JSON.parse(userInfo);
      this.setState({
        userId: userInfo.id,
      });
    }
    this.getNotifications();
  }

  getNotifications = () => {
    console.log(`${API_URL}readNotification`);
    fetch(`${API_URL}readNotification`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({user_id: this.state.userId, page: this.state.page}),
    })
      .then((res) => res.json())
      .then((response) => {
        let pageNumber = this.state.page;

        if (pageNumber === 1) {
          this.setState({
            notifications: response.data,
            contentLoading: false,
            pageMeta: response.meta,
          });
        } else {
          this.setState({
            notifications: this.state.notifications.concat(response.data),
          });
        }
      })
      .catch((err) => {
        console.log(err);
        this.setState({contentLoading: false});
      });
  };

  onEndReached = () => {
    let newPage = this.state.page + 1;
    if (newPage <= this.state.pageMeta.pages) {
      this.setState(
        {
          page: newPage,
        },
        () => this.merchantOrderList(this.state.filterType),
      );
    } else {
      this.setState({
        loadMore: false,
      });
    }
  };

  render() {
    const {colors} = this.props;

    const ContentLoader = () => {
      const array = [0, 1, 2, 3, 4, 5, 6, 7];
      return (
        <View style={{flex: 1, backgroundColor: colors.backgroundColor}}>
          <SkeletonPlaceholder backgroundColor={colors.cardColor}>
            {array.map((item) => (
              <View style={{height: 90, marginBottom: 5}} key={item} />
            ))}
          </SkeletonPlaceholder>
        </View>
      );
    };

    return (
      <>
        <Header title="Notifications" hideNotification={true} back={true} />
        {this.state.contentLoading ? (
          <ContentLoader />
        ) : (
          <View style={styles.container(colors.secondaryColor)}>
            {this.state.notifications.length > 0 ? (
              <FlatList
                data={this.state.notifications}
                keyExtractor={(_, i) => i}
                style={{paddingHorizontal: 10}}
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
                renderItem={({item}) => {
                  return (
                    <View
                      style={styles.notificationContainer(colors.borderColor)}>
                      <View>
                        <View style={styles.text}>
                          <Text style={styles.name(colors.textColor)}>
                            {item.title}
                          </Text>
                          <Text
                            style={{
                              color: colors.textLight,
                              opacity: 0.8,
                              flexWrap: 'wrap',
                            }}>
                            {item.description}
                          </Text>
                        </View>
                        <Text style={styles.timeAgo}>{item.at}</Text>
                      </View>
                    </View>
                  );
                }}
              />
            ) : (
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  flex: 1,
                }}>
                <>
                  <LottieView
                    source={NoNotifications}
                    autoPlay
                    loop
                    style={{
                      marginBottom: 20,
                      height: 200,
                      paddingLeft: 20,
                    }}
                  />
                </>
                <Text style={{color: colors.textLight, fontSize: 17}}>
                  No Notifications Found
                </Text>
              </View>
            )}
          </View>
        )}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  var theme = getThemeColors(state.theme);
  return {colors: theme};
};

export default connect(mapStateToProps)(Notifications);

const styles = StyleSheet.create({
  container: (bgColor) => ({
    flex: 1,
    backgroundColor: bgColor,
  }),
  notificationContainer: (color) => ({
    padding: 16,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: color,
    alignItems: 'flex-start',
  }),
  text: {
    marginBottom: 5,
    // flexDirection: 'row',
    // flexWrap: 'wrap',
  },
  timeAgo: {
    fontSize: 12,
    color: '#696969',
  },
  name: (color) => ({
    fontSize: 16,
    color: color,
  }),
});

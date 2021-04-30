import React, {Component} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Linking,
} from 'react-native';
// import {TouchableRipple} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Menu, {MenuItem, MenuDivider} from 'react-native-material-menu';
import {connect} from 'react-redux';
import {getThemeColors} from '../../global/themes';

class ListCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
      expanded: false,
    };

    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  getBackgroundColor = (color) => {
    if (color === 'success') {
      return '#5cb85c';
    } else if (color === 'danger') {
      return '#d9534f';
    } else if (color === 'primary') {
      return '#0275d8';
    } else if (color === 'warning') {
      return '#f0ad4e';
    } else if (color === 'info') {
      return '#5bc0de';
    } else if (color === 'dark') {
      return '#23272B';
    } else {
      return color;
    }
  };

  _menu = null;

  setMenuRef = (ref) => {
    this._menu = ref;
  };

  hideMenu = () => {
    this._menu.hide();
  };

  showMenu = () => {
    this._menu.show();
  };

  render() {
    const {colors, dataItem, currency} = this.props;

    // console.log(currency);

    return (
      <>
        <View
          style={[
            this.props.style,
            {
              margin: 5,
              borderWidth: 1,
              borderColor: '#999999',
              elevation: 1,
              borderRadius: 15,
              marginHorizontal: 15,
              // backgroundColor: this.props.activeColor,
            },
          ]}>
          <View
            style={this.state.expanded ? styles.cardExpand : styles.cardNormal}>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.textStyle}>Order No. {dataItem.id}</Text>
              <View
                style={{
                  marginLeft: 'auto',
                  flexDirection: 'row',
                  // zIndex: 99999,
                }}>
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 5,
                    paddingBottom: 5,
                  }}
                  onPress={() => {
                    this.toggleExpand();
                  }}>
                  <Icon size={22} name="info" color="#a4b5c5" />
                </TouchableOpacity>

                {dataItem.actions && dataItem.actions.length > 0 && (
                  <>
                    <Menu
                      ref={this.setMenuRef}
                      style={{backgroundColor: colors.secondaryColor}}
                      button={
                        <TouchableOpacity
                          style={{
                            paddingHorizontal: 5,
                            paddingBottom: 5,
                          }}
                          onPress={() => {
                            this._menu.show();
                          }}>
                          <MaterialCommunityIcons
                            size={22}
                            name="dots-vertical"
                            color="#a4b5c5"
                          />
                        </TouchableOpacity>
                      }>
                      {dataItem.actions.map((item, i) => {
                        return (
                          <>
                            {item.statusList !== undefined ? (
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
                                        this.props.onMenuPress(
                                          item.type,
                                          list.VALUE,
                                        );
                                        this._menu.hide();
                                      }}
                                      key={i}>
                                      <Text style={{color: colors.textColor}}>
                                        {' '}
                                        {list.LABEL}
                                      </Text>
                                    </MenuItem>
                                  );
                                })}
                                <View
                                  style={{
                                    borderBottomColor: colors.borderColor,
                                    borderBottomWidth: 1,
                                  }}
                                />
                              </>
                            ) : (
                              <MenuItem
                                onPress={() => {
                                  this.props.onMenuPress(item.type);
                                  this._menu.hide();
                                }}
                                key={i}>
                                <Text style={{color: colors.textColor}}>
                                  {item.text}
                                </Text>
                              </MenuItem>
                            )}
                          </>
                        );
                      })}
                    </Menu>
                  </>
                )}
              </View>
            </View>
            <Text
              style={{
                color: this.state.expanded ? '#fff' : colors.cardTextColor,
                fontSize: 21,
                fontWeight: 'bold',
              }}>
              {dataItem.number}
            </Text>

            <View style={{marginTop: 10}}>
              <Text style={[styles.textStyle, {textAlignVertical: 'center'}]}>
                <Icon name="phone" size={16} color="#999999" /> :
                <TouchableOpacity
                  onPress={() => {
                    Linking.openURL(`tel:${dataItem.client.phone}`);
                  }}>
                  <Text
                    style={{
                      color: '#78A3E8',
                    }}>
                    {' '}
                    {dataItem.client.phone}
                  </Text>
                </TouchableOpacity>
                ,
                <TouchableOpacity
                  onPress={() => {
                    Linking.openURL(`tel:${dataItem.client.company.phone}`);
                  }}>
                  <Text
                    style={{
                      color: '#78A3E8',
                    }}>
                    {dataItem.client.company.phone}
                  </Text>
                </TouchableOpacity>
              </Text>
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={[
                    styles.textStyle,
                    {flexDirection: 'row', textAlignVertical: 'center'},
                  ]}>
                  <MIcon name="business-center" size={16} color="#999999" /> :{' '}
                  {dataItem.client.company.name}
                </Text>
                <View style={{marginLeft: 'auto'}}>
                  <Text style={styles.textStyle}>
                    <MaterialCommunityIcons
                      name="road-variant"
                      size={16}
                      color="#999999"
                    />{' '}
                    : {dataItem.client.street_addr}
                  </Text>
                </View>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.textStyle}>
                  <MIcon name="business" size={16} color="#999999" /> :{' '}
                  {dataItem.client_area}
                </Text>
                <View style={{marginLeft: 'auto'}}>
                  <Text style={styles.textStyle}>
                    <MaterialCommunityIcons
                      name="map-marker-distance"
                      size={16}
                      color="#999999"
                    />{' '}
                    : {dataItem.pickup_point.street} [
                    {dataItem.pickup_point.title}]
                  </Text>
                </View>
              </View>
            </View>

            <View style={{flexDirection: 'row', marginTop: 10}}>
              <Text style={styles.textStyle}>Order Placed at</Text>
              <View style={{marginLeft: 'auto'}}>
                <Text style={styles.textStyle}>Status</Text>
              </View>
            </View>
            <View style={{flexDirection: 'row', marginTop: 2}}>
              <Text
                style={
                  this.state.expanded
                    ? styles.textWhite('white')
                    : styles.textBlack(colors.textColor)
                }>
                {dataItem.delivery_date} {dataItem.delivery_time}
              </Text>
              <View style={{marginLeft: 'auto'}}>
                <Text
                  style={styles.badgeStyle(
                    this.getBackgroundColor(dataItem.status.color),
                  )}>
                  {dataItem.status.name}
                </Text>
              </View>
            </View>
          </View>
          {this.state.expanded && (
            <View style={styles.childCard(colors.cardColor)}>
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.textStyle}>
                  <Icon name="users" size={15} color="#999999" /> Customer :{' '}
                </Text>
                <Text style={styles.textBlack(colors.textColor)}>
                  {dataItem.customer.name + ' - ' + dataItem.customer.area}
                </Text>
              </View>
              <View style={{flexDirection: 'row', marginTop: 5}}>
                <Text style={styles.textStyle}>
                  <Icon name="clock" size={15} color="#999999" /> Deadline :{' '}
                </Text>
                <Text style={styles.textBlack(colors.textColor)}>
                  1st March,2021
                </Text>
              </View>
              <View style={{flexDirection: 'row', marginTop: 5}}>
                <Text style={styles.textStyle}>
                  <MIcon name="delivery-dining" size={15} color="#999999" />{' '}
                  Delivery Charge :{' '}
                </Text>
                <Text style={styles.textBlack(colors.textColor)}>
                  {currency}
                  {dataItem.delivery_charge}
                </Text>
              </View>
              <View style={{flexDirection: 'row', marginTop: 5}}>
                <Text style={styles.textStyle}>
                  <Icon name="dollar-sign" size={15} color="#999999" /> Cash
                  Collection:{' '}
                </Text>
                <Text style={styles.textBlack(colors.textColor)}>
                  {currency}
                  {dataItem.cash_amount}
                </Text>
              </View>
              <View style={{flexDirection: 'row', marginTop: 5}}>
                <Text style={styles.textStyle}>
                  <MaterialCommunityIcons
                    name="weight"
                    size={15}
                    color="#999999"
                  />{' '}
                  Product Weight:{' '}
                </Text>
                <Text style={styles.textBlack(colors.textColor)}>
                  {dataItem.product_weight} KG
                </Text>
              </View>
            </View>
          )}
        </View>
      </>
    );
  }

  toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.setState({expanded: !this.state.expanded});
  };
}

const mapStateToProps = (state) => {
  var theme = getThemeColors(state.theme);
  return {colors: theme};
};

export default connect(mapStateToProps)(ListCard);

const styles = StyleSheet.create({
  textStyle: {
    color: '#a4b5c5',
    fontSize: 16,
  },
  textBlack: (color) => ({
    color: color,
    fontSize: 16,
    opacity: 0.6,
  }),
  textWhite: (cardTextColor) => ({
    color: cardTextColor,
    fontSize: 16,
    opacity: 0.8,
  }),
  badgeStyle: (bgColor) => ({
    color: '#fff',
    fontSize: 13,
    backgroundColor: bgColor,
    paddingHorizontal: 6,
    paddingVertical: 1.2,
    borderRadius: 8,
    textTransform: 'uppercase',
    elevation: 1.2,
  }),
  cardNormal: {
    // backgroundColor: bgColor,
    padding: 10,
    // borderRadius: 15,
  },
  childCard: (bgColor) => ({
    backgroundColor: bgColor,
    padding: 10,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  }),
  cardExpand: {
    backgroundColor: '#014CA7',
    padding: 10,
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
  },
});

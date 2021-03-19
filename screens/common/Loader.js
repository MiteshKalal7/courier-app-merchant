import React from 'react';
import {StyleSheet, Text, View, ActivityIndicator} from 'react-native';

export default function Loader(props) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={props.color} />
      <Text style={styles.loadingText}>Please Wait ...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.75,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  loadingText: {
    fontSize: 20,
    color: '#ffffff',
    paddingTop: 20,
    fontWeight: 'bold',
  },
});

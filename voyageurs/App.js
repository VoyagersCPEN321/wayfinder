import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet, TouchableOpacity,
} from "react-native";

import MapScreen from './MapScreen.js';
import CalendarScreen from './CalendarScreen.js';
import LoginScreen from './LoginScreen.js'
import { createBottomTabNavigator } from 'react-navigation'
import Icon from 'react-native-vector-icons/Ionicons'
import { createStackNavigator } from 'react-navigation'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
const icon = (<FontAwesome name={'comments'} />);

const tabBarNavigation =  createBottomTabNavigator({
  MapScreen: {
    screen: MapScreen,
    navigationOptions: {
      tabBarLabel: 'Map',
      tabBarVisible: true,
      tabBarIcon: ({ tintColor }) => (
        <Icon name="ios-map" color={tintColor} size={24} />
      ),
      headerVisible: false,
    }
  },
  // Settings: {
  //   screen: Settings,
  //   navigationOptions: {
  //     tabBarLabel: 'Settings',
  //     tabBarVisible: true,
  //     tabBarIcon: ({ tintColor }) => (
  //       <Icon name="ios-settings" color={tintColor} size={24} />
  //     ),
  //     headerVisible: false
  //   }
  // },
  Calendar: {
    screen: CalendarScreen,
    navigationOptions: {
      tabBarLabel: 'Calendar',
      tabBarVisible: true,
      tabBarIcon: ({ tintColor }) => (
        <Icon name="ios-calendar" color={tintColor} size={24} />
      ),
      headerVisible: false
    }
  }

}, {//router config
    initialRouteName: 'MapScreen',
    order: ['MapScreen', 'Calendar'],
    //navigation for complete tab navigator

    tabBarOptions: {
      activeTintColor: 'red',
      inactiveTintColor: 'grey',
    },
    headerMode: 'none',
    navigationOptions: {
      headerVisible: false,
    }
  });

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  LogOut: {
    marginRight: 15

  }
});

export default createStackNavigator({
  LoginScreen: { screen: LoginScreen },
  MainScreen: tabBarNavigation
}, {
    initialRouteName: 'LoginScreen',
  //   headerMode: 'none',
    navigationOptions:  {
      headerLeft: null,
      headerRight: (
        <TouchableOpacity
          style={styles.LogOut}
          onPress={MapScreen.LogOut}>
          <FontAwesome name={'sign-out'} size={30} color="#fff" />
        </TouchableOpacity>
      ),
      title: 'Home',
      headerStyle: {
        backgroundColor: '#f4511e',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      }
  }
});

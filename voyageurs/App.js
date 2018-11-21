import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet
} from "react-native";
import MapScreen from './MapScreen.js';
import Settings from './SettingsScreen.js';
import CalendarScreen from './CalendarScreen.js';
import LoginScreen from './LoginScreen.js'
import { createBottomTabNavigator } from 'react-navigation'
import Icon from 'react-native-vector-icons/Ionicons'

import { NavigationActions } from 'react-navigation';


export default  createBottomTabNavigator({


  LoginScreen: {
    screen: LoginScreen,
    navigationOptions: {
      tabBarLabel: 'Login',
      tabBarVisible: false,
      tabBarIcon: ({ tintColor }) => (
        <Icon name="ios-home" color={tintColor} size={24} />
      )
    }
  },


  MapScreen: {
    screen: MapScreen,
    navigationOptions: {
      tabBarLabel: 'Map',
      tabBarVisible: true,
      tabBarIcon: ({ tintColor }) => (
        <Icon name="ios-map" color={tintColor} size={24} />
      )
    }
  },
  Settings: {
    screen: Settings,
    navigationOptions: {
      tabBarLabel: 'Settings',
      tabBarVisible: true,
      tabBarIcon: ({ tintColor }) => (
        <Icon name="ios-settings" color={tintColor} size={24} />
      )
    }
  },
  Calendar: {
    screen: CalendarScreen,
    navigationOptions: {
      tabBarLabel: 'Calendar',
      tabBarVisible: true,
      tabBarIcon: ({ tintColor }) => (
        <Icon name="ios-calendar" color={tintColor} size={24} />
      )
    }
  }

}, {//router config
    initialRouteName: 'LoginScreen',
    order: ['LoginScreen','MapScreen', 'Calendar', 'Settings'],
    //navigation for complete tab navigator

    tabBarOptions: {
      activeTintColor: 'red',
      inactiveTintColor: 'grey'
    }
  });

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

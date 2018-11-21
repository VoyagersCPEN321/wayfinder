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
import { createStackNavigator } from 'react-navigation'

import { NavigationActions } from 'react-navigation';

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
  Settings: {
    screen: Settings,
    navigationOptions: {
      tabBarLabel: 'Settings',
      tabBarVisible: true,
      tabBarIcon: ({ tintColor }) => (
        <Icon name="ios-settings" color={tintColor} size={24} />
      ),
      headerVisible: false
    }
  },
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
    order: ['MapScreen', 'Calendar', 'Settings'],
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

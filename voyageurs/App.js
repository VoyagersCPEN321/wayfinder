import React from "react";
import {
  View,
  StyleSheet, TouchableOpacity,
} from "react-native";
import MapScreen from './MapScreen.js';
import CalendarScreen from './CalendarScreen.js';
import LoginScreen from './LoginScreen.js'
import { createBottomTabNavigator } from 'react-navigation'
import Icon from 'react-native-vector-icons/Ionicons'
import { createStackNavigator } from 'react-navigation'
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const tabBarNavigation = createBottomTabNavigator({
  MapScreen: {
    screen: MapScreen,
    navigationOptions: {
      tabBarLabel: 'Map',
      tabBarVisible: true,
      tabBarIcon: ({ tintColor }) => (
        <Icon name="ios-map" color={tintColor} size={24} />
      ),
      tabBarOptions: {
        activeTintColor: 'white',
        inactiveTintColor: '#4367b0',
        activeBackgroundColor: '#4367b0',
        inactiveBackgroundColor: 'white'
      },
      headerVisible: false,
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
      tabBarOptions: {
        activeTintColor: 'white',
        inactiveTintColor: '#4367b0',
        activeBackgroundColor: '#4367b0',
        inactiveBackgroundColor: 'white'
      },
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
  logOutButton: {
    position: 'absolute',
    left: "60%",
    marginRight: 35,
    marginLeft: 5
  },
  uploadButton: {
    marginRight: 70,
    marginLeft: 20
  }
});

renderHeaderButtons = () => {
  return (
    <View>
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={MapScreen.pickDocument}>
        <FontAwesome name="cloud-upload" size={35} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.logOutButton}
        onPress={MapScreen.LogOut}>
        <FontAwesome name={'sign-out'} size={35} color="#fff" />
      </TouchableOpacity>
    </View>
  )
}
export default createStackNavigator({
  LoginScreen: { screen: LoginScreen },
  MainScreen: tabBarNavigation
}, {
    initialRouteName: 'LoginScreen',
    navigationOptions: {
      headerLeft: null,
      headerRight: renderHeaderButtons(),
      title: 'Home',
      headerStyle: {
        backgroundColor: '#4367b0',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      }
    }
    
  });

import React, { Component } from 'react';
import {
  View,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ImageBackground,
  Image,
  TouchableOpacity,
} from 'react-native';
import { AsyncStorage } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons'

import * as CONSTANTS from "./constants";
import { Permissions, Notifications } from 'expo';

const APP_ID = "171287213807359";
const FB_AUTH = "/auth/fb/";

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.init();
    this.state = { email: 'Test@test.com', password: '123456', error: '', loading: true, token: null };
  }

  init = async () => {
    let token = await AsyncStorage.getItem(CONSTANTS.TOKEN_LOCATION);
    if (token) {
      this.gotoMapScreen();
      this.setState({ loading: false });
    } else {
      this.setState({ loading: false });
    }
  }

  static navigationOptions = {
    title: 'UBC WayFinder',
    headerRight: null
  };

  gotoMapScreen = () => {
    this.props.navigation.navigate('MainScreen');
  }

  loginFailedAlert = () => {
    Alert.alert("Login Failed please try again");
  }

  logIn = async function (view) {
    try {
      const {
        type,
        token
      } = await Expo.Facebook.logInWithReadPermissionsAsync(APP_ID, {
        permissions: ['public_profile']
      });
      if (type === 'success') {

        pushToken = await registerForPushNotificationsAsync();

        this.setState({ loading: true });
        console.log(pushToken)
        /* Request JWT from server */
        await view.getJWT(token, pushToken).then(() => {
          if (!view.state.token) {
            view.loginFailedAlert();
            this.setState({ loading: false });
          } else {
            // TODO delete
            view.gotoMapScreen();
            this.setState({ loading: false });
          }
        });
      } else {
        view.loginFailedAlert();
        this.setState({ loading: false });
      }
    } catch (e) {
      alert(`Facebook Login Error: ` + e);
      this.setState({ loading: false });
    }
  }

  getJWT = async (fbToken, pushToken) => {
    console.log(pushToken);
    return fetch(CONSTANTS.APP_URL + FB_AUTH, {
      method: "POST",
      headers: new Headers({
        'Authorization': 'Bearer ' + fbToken,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        token: pushToken
      }),
    }).then((res) => {
      if (res.status == 200) {
        return this.extractToken(res);
      } else {
        this.loginFailedAlert();
        return;
      }
    });
  }

  extractToken = async (res) => {
    return res.json().then(async (jsonBody) => {
      if (!jsonBody.token) {
        this.loginFailedAlert();
        console.log("Failed here at .json getJWT");
        console.log(jsonBody);
        return;
      } else {
        this.setState({ token: jsonBody.token })
        await AsyncStorage.setItem(CONSTANTS.TOKEN_LOCATION, jsonBody.token);
      }
    });
  }


  renderBusyIndicator = () => {
    if (this.state.loading) {
      return (
        <Modal
          visible={this.state.loading}
          transparent={true}
          animationType={'none'}
          onRequestClose={() => { }}>
          <ActivityIndicator animating={this.state.loading} size="large" style={styles.busyIndicator} />
        </Modal>);
    }
    return null;
  }

  render() {
    return (
      <View style={styles.container}>
        <ImageBackground source={require('./images/mapBackground.png')} style={{ width: '100%', height: '100%' }}>
          <Image source={require('./images/navigatorLogo.png')} style={styles.logo} />
          {this.renderBusyIndicator()}
          <TouchableOpacity onPress={() => this.logIn(this)}>
            <Image source={require('./images/loginWithFacebookButton.png')} style={styles.loginButton} />
          </TouchableOpacity>
          
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container:{
    width: "100%",
    height: "100%",
    flex: 1,
    flexDirection: 'column',
    backgroundColor: "rgba(255, 255, 255, 0.0)"
  },
  indicator: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  busyIndicator: {
    height: '100%',
    width: '100%',
    backgroundColor: "rgba(255, 255, 255, 0.5)"
  },
  logo: {
    marginBottom: 150,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 100,
    alignItems: 'center'
  },
  loginButton: {
    width: "85%",
    height: 56,
    marginLeft: 'auto',
    marginRight: 'auto',
  }
});

async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Permissions.getAsync(
    Permissions.NOTIFICATIONS
  );
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log("Push Notifications permissions not granted");
    return;
  }

  let token = await Notifications.getExpoPushTokenAsync();
  console.log(token);
  return token;
}
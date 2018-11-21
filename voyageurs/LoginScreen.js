import React, {Component} from 'react';
import { 
  View,
  Button,
  Alert, 
  StyleSheet,
  ActivityIndicator,
  Header 
} from 'react-native';
import { AsyncStorage } from "react-native";
import * as CONSTANTS from "./constants";

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
    } else {
      this.setState({ loading : false});
    }
  }

  static navigationOptions = {
    title: 'UBC WayFinder'
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
        /* Request JWT from server */
        await view.getJWT(token).then(() => {
          if(!view.state.token) {
            view.loginFailedAlert();
          } else {
            // TODO delete
            view.gotoMapScreen();
          }
        });
      } else {
        view.loginFailedAlert();
      }
    } catch (e) {
      alert(`Facebook Login Error: ` + e);
    }
  }

  getJWT = async (fbToken) => {
    return fetch(CONSTANTS.APP_URL + FB_AUTH, {
      method: "POST",
      headers: new Headers({
        'Authorization': 'Bearer ' + fbToken
      })
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
    return res.json().then( async (jsonBody) => {
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
    if(this.state.loading) {
      return (
      <View style={styles.indicator}>
        <ActivityIndicator animating={this.state.loading} size="small"/>
      </View>);
    }
    return null;
  }

  render() {
    return (
      <View style={{
        width: "100%",
        height: 80,
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        bottom: 300,
        backgroundColor: "rgba(255, 255, 255, 0.0)"
      }}>
        {this.renderBusyIndicator()}
        <Button testID="loginButton" 
          title="Login-with Facebook"
          onPress={() => this.logIn(this)}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  indicator: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
});


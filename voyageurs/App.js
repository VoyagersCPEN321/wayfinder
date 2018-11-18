import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import DirectionsView from './MapScreen';
import MapScreen from './MapScreen';
import { AsyncStorage } from "react-native"



const APP_ID = "171287213807359";
const APP_URL = "http://104.41.132.251:8080";
const FB_AUTH = "/auth/fb/";

class LoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { email: 'Test@test.com', password: '123456', error: '', loading: false, token: null };
  }

  static navigationOptions = {
    title: 'UBC WayFinder',
  };

  gotoMapScreen = () => {
    this.props.navigation.navigate('MapScreen');
  }

  loginFailedAlert = () => {
    Alert("Login Failed please try again");
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
    return fetch(APP_URL + FB_AUTH, {
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
        await AsyncStorage.setItem('@tokenStore', jsonBody.token);
        // TODO remove
        console.log("stored user token successfully");
      }
    });
  }

  pickDocument = async () => {
    const document = await Expo.DocumentPicker.getDocumentAsync(
      {
        type : "text/calendar",
        copyToCacheDirectory : true,
      }
    );
    console.log('result', document);

    const data = new FormData();

    data.append('name', 'new_calendar'); 
    data.append('calendar', {
      uri: document.uri,
      type: 'text/calendar', 
      name: 'uploaded_calendar'
    });
    
    fetch("http://40.117.145.64:8080/schedule", {
      method: 'POST',
      headers: {
        'x-auth-token': await AsyncStorage.getItem('token'),
      },
      body: data
    }).then(res => {
      console.log(res)
    });

  }

  render() {
    //const { navigate } = this.props.navigation;
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
        <Button
          title="Login-with Facebook"
          onPress={() => this.logIn(this)}
        />
      
      <Button
          title="files"
          onPress={ this.pickDocument }
      />

    

      </View>
    );
  }
}

const App = createStackNavigator({
  LoginScreen: { screen: LoginScreen },
  MapScreen: { screen: MapScreen },
}, {
    initialRouteName: 'LoginScreen',
  });

export default App;
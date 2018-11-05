import React from 'react';
import { View, Text, Button } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import DirectionsView from './MapScreen';
import MapScreen from './MapScreen';

const APP_ID = "171287213807359";
class LoginScreen extends React.Component {
  static navigationOptions = {
    title: 'UBC WayFinder',
  }; 
  
  logIn = async function() {
    try {
      const {
        type,
        token,
        expires,
        permissions,
        declinedPermissions,
      } = await Expo.Facebook.logInWithReadPermissionsAsync(APP_ID, {
        permissions: ['public_profile'],
      });
      console.log(await Expo.Facebook.logInWithReadPermissionsAsync(APP_ID, {
        permissions: ['public_profile', 'email'],
      }));
      if (type === 'success') {
        // Get the user's name using Facebook's Graph API
        const response = await fetch(`https://graph.facebook.com/me?access_token=${token}&fields=id,name,email`);
        //Alert.alert('Logged in!', `Hi ${(await response.json()).name}!`);
        console.log(await response.json());
        console.log(type);
        console.log(token);
        console.log(expires);
        console.log(permissions);
        console.log(declinedPermissions);
      } else {
        console.log("login failed");
      }
    } catch (e) {
      console.log(e);
      //alert(`Facebook Login Error: `);
    }
  }
  
  render() {
    //const { navigate } = this.props.navigation;
    return (
      <Button
        title="Login with Facebook"
        onPress={this.logIn}
      />
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
import React from 'react';
import { View, Text, Button } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import DirectionsView from './MapScreen';
import MapScreen from './MapScreen';

const APP_ID = "171287213807359";
class LoginScreen extends React.Component {
  constructor(props) {
    super(props);
    //this.state = { email: 'Test@test.com', password: '123456', error: '', loading: false };
  }

  static navigationOptions = {
    title: 'UBC WayFinder',
  };

  gotoMapScreen = () => {
    this.props.navigation('MapScreen');
  }

  logIn = async function (view) {
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
        /* Dummy Nvaigation TODO remove. */
        const { navigate } = view.props.navigation;
        navigate('MapScreen');
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
          title="Login with Facebook"
          onPress={() => this.logIn(this)}
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
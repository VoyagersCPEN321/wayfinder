import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert
} from "react-native";
import LoginScreen from './LoginScreen.js';
import { AsyncStorage } from "react-native"

const APP_URL = "http://128.189.94.150:8080";
//const APP_URL = "http://104.211.14.232:8080";
export default class Settings extends Component {
  constructor(props) {
    super(props);
  }

  goToLoginScreen = () => {
    this.props.navigation.navigate('LoginScreen');
  }

  pickDocument = async () => {
    let token = await AsyncStorage.getItem('@tokenStore:token');
    if (!token) {
      Alert.alert("Please login!");
      this.goToLoginScreen();
    }

    const document = await Expo.DocumentPicker.getDocumentAsync(
      {
        type : "text/calendar",
        copyToCacheDirectory : true,
      }
    );
    if(!document.type) {
      return;
    }

    let fileData = await Expo.FileSystem.readAsStringAsync(document.uri);
    fetch(APP_URL+"/schedule", {
      method: 'POST',
      headers: {
        'x-auth-token': token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        icsData: fileData
      })
    }).then(async res => {
      console.log(await res.json())
    });
  }
  render() {
    return (
      <View style={styles.container}>
        <Button
          title="Upload Schedule"
          onPress={ this.pickDocument }
      />

      </View>

    );
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    }
  });
  

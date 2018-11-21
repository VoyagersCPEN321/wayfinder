import React, { Component } from "react";
import {
  View,
  StyleSheet,
  Button,
  Alert
} from "react-native";
import { AsyncStorage } from "react-native"
import * as CONSTANTS from "./constants";

export default class Settings extends Component {
  constructor(props) {
    super(props);
  }

  static navigationOptions = {
    title: 'Settings'
  };

  goToLoginScreen = () => {
    this.props.navigation.navigate('LoginScreen');
  }

  pickDocument = async () => {
    let token = await AsyncStorage.getItem(CONSTANTS.TOKEN_LOCATION);
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

    if(document.type !== "success") {
      return;
    }

    let fileData = await Expo.FileSystem.readAsStringAsync(document.uri);
    fetch(CONSTANTS.APP_URL+"/schedule", {
      method: 'POST',
      headers: {
        'x-auth-token': token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        icsData: fileData
      })
    }).then(async (res) => {
      let events = await res.json();
      console.log(events);
      await AsyncStorage.setItem(CONSTANTS.SCHEDULE_LOCATION, JSON.stringify(events));
      console.log("got here       ");
      console.log(await AsyncStorage.getItem(CONSTANTS.SCHEDULE_LOCATION));
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
  

import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button
} from "react-native";
import LoginScreen from './LoginScreen.js';
import { AsyncStorage } from "react-native"



export default class Settings extends Component {

  render() {
    return (
      <View style={styles.container}>
        <Button
          title="Upload Schedule"
          onPress={ LoginScreen.pickDocument }
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
  

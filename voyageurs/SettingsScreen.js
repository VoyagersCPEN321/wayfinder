import React, { Component } from "react";
import {
  View,
  StyleSheet,
  Button,
  Alert,
  ActivityIndicator,
  Modal
} from "react-native";
import { AsyncStorage } from "react-native"
import * as CONSTANTS from "./constants";

export default class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {loading: false};
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

    this.setState({loading: true});
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
      if(res.status == 200) {
        console.log(res);
        let events = (await res.json()).events;
        console.log(events);
        await AsyncStorage.setItem(CONSTANTS.SCHEDULE_LOCATION, JSON.stringify(events));
        console.log("got here       ");
        console.log(await AsyncStorage.getItem(CONSTANTS.SCHEDULE_LOCATION));
      } else {
        let message = (await res.json()).message;
        Alert.alert(message);
      }
      this.setState({loading: false});
    }).catch((err) => {
      this.setState({loading: false});
      console.log(err);
      Alert.alert("error");
    });
  }

  renderBusyIndicator = () => {
    if(this.state.loading) {
      return (
      <View style={styles.indicator}>
          <Modal 
            visible={this.state.loading}
            transparent={false}
            animationType={'none'}
            onRequestClose = {() => {}}
            style={styles.modal}>
              <ActivityIndicator animating={this.state.loading} size="large" style={styles.busyIndicator}/>
          </Modal>
      </View>);
    }
    return null;
  }

  render() {
    return (
      <View style={styles.container}>
        {this.renderBusyIndicator()}
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
    },
    busyIndicator: {
      height: '100%',
      width: '100%'
    },
    modal: {
      backgroundColor: "rgba(255, 255, 255, 0.1)"
    }
  });
  

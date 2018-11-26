import React, { Component } from "react";
import MapView, { Callout } from "react-native-maps";
import Geocoder from "react-native-geocoding";
import MapViewDirections from "react-native-maps-directions";
import {
  StyleSheet,
  Text,
  View, Button, Alert, NetInfo,
  TouchableOpacity,
  Modal, ActivityIndicator
} from "react-native";
import { AsyncStorage } from "react-native";
import * as CONSTANTS from "./constants";
import Icon from 'react-native-vector-icons/Ionicons'

var ep = require("./eventProcessor.js");

const LATITUDEDELTA = 0.0122;
const LONGITUDEDELTA = .0221;
const GOOGLE_MAPS_APIKEY = "AIzaSyCvW9JtKWa3ftr-FD-bGsFqR9EBQMlGn7k";
Geocoder.init(GOOGLE_MAPS_APIKEY); // use a valid API key
const NOT_AVAILABLE = "N/A";
export default class MapScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialPosition: {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0,
        longitudeDelta: 0,
      },
      markerPosition: {
        latitude: 0,
        longitude: 0,
      },
      destination: {
        latitude: 49.2580,
        longitude: -123.253,
      },
      showDirections: false,
      nextClassInfo: null,
      loading: true,
      events: [],
      distanceInfo: {
        time: 0,
        distance: 0
      }
    };

    NetInfo.isConnected.addEventListener('connectionChange', this.handleFirstConnectivityChange);
    this.init();
    CONSTANTS.MapScreenRef.actualInstance = this;
  }

  handleFirstConnectivityChange = (connectionInfo) => {
    console.log('First change, type: ' + connectionInfo.type + ', effectiveType: ' + connectionInfo.effectiveType);
    NetInfo.removeEventListener(
      'connectionChange',
      handleFirstConnectivityChange
    );
  }

  goToLoginScreen = () => {
    console.log("called gotologin");
    console.log(this.props.navigation.navigate);
    this.props.navigation.navigate("LoginScreen");
  }

  init = async () => {
    let events = JSON.parse(await AsyncStorage.getItem(CONSTANTS.SCHEDULE_LOCATION));
    if (events) {
      this.setState({ events: events });
    } else {
      await this.fetchSchedule();
    }
    this.setState({ loading: false });
  }

  /* removes the unwanted header. */
  static navigationOptions = {
    header: null,
  };

  componentDidMount() {
    navigator.geolocation.getCurrentPosition((position) => {
      var lat = parseFloat(position.coords.latitude);
      var long = parseFloat(position.coords.longitude);

      var initialRegion = {
        latitude: lat,
        longitude: long,
        latitudeDelta: LATITUDEDELTA,
        longitudeDelta: LONGITUDEDELTA,
      };

      this.setState({ initialPosition: initialRegion });
      this.setState({ markerPosition: initialRegion });
    }, (error) => alert(JSON.stringify(error)),
      { enableHighAccuracy: true, maximumAge: 1000 });
  }

  getDestination = async () => {
    this.setState({ loading: true });
    try {
      if (this.state.events.length > 0) {
        await this.getToNextClass();
      } else {
        this.setState({ loading: false });
        Alert.alert("Please upload your schedule.");
        return;
      }
    } catch (e) {
      Alert.alert("Oops, something went wrong please try again.");
    }
    this.setState({ loading: false });
  }

  fetchSchedule = async () => {
    return NetInfo.isConnected.fetch().then(async (isConnected) => {
      if (!isConnected) {
        console.log(isConnected);
        Alert.alert("You are not connected to the internet");
        this.setState({ loading: false });
      }
      else {
        let token = await AsyncStorage.getItem(CONSTANTS.TOKEN_LOCATION);
        if (token) {
          await fetch(CONSTANTS.APP_URL + "/schedule", {
            method: "GET",
            headers: {
              'x-auth-token': token
            }
          }).then(this.handleResponse)
            .catch((error) => {
              console.log("Unable to connect to server. Error: " + error);
              Alert.alert("Unable to connect to server. Error: " + error);
              this.setState({ loading: false });
            });
        } else {
          this.setState({ loading: false });
          this.goToLoginScreen();
        }
      }
    });
  }

  handleResponse = async (response) => {
    if (response.status == 200) {
      await response.json().then(async (schedule) => {
        if (schedule && schedule.events) {
          await AsyncStorage.setItem(CONSTANTS.SCHEDULE_LOCATION, JSON.stringify(schedule.events));
          this.setState({ events: schedule.events.slice() });
        } else {
          Alert.alert("Unexpected Error, Please try again.");
        }
      });
    } else if (response.status == 404) {
      Alert.alert("Please upload your schedule.");
    } else {
      Alert.alert("Unexpected Error please try again.");
    }
    this.setState({ loading: false });
  }

  getToNextClass = async () => {
    let allEvents = this.state.events;
    let today = new Date();
    var todayClasses = allEvents.filter((event) => ep.isHappeningOnDay(event, today));
    if (todayClasses.length > 0) {
      try {
        let nextEvent = ep.getNextClass(todayClasses);
        if (!nextEvent) {
          Alert.alert("Done for the day!");
        } else {
          await this.updateEventGeoLocation(nextEvent);
        }
      } catch (e) {
        Alert.alert(e.message);
      }
    } else {
      Alert.alert("No classes today!");
    }
  }

  updateEventGeoLocation = async (nextEvent) => {
    if (!nextEvent || !nextEvent.location || nextEvent.location === NOT_AVAILABLE) {
      Alert.alert("Event doesn't have a valid location check your calendar for event details.");
      return;
    } else {
      return Geocoder.from(nextEvent.location)
        .then((json) => {
          var location = json.results[0].geometry.location;

          var destinationResult = {
            latitude: location.lat,
            longitude: location.lng,
          }

          this.setState({ destination: destinationResult });
          this.setState({ showDirections: true });
          this.setState({ nextClassInfo: nextEvent.summary + ", " + nextEvent.room });
        })
        .catch((error) => {
          Alert.alert("Unexpected geocoder communication error, please try again.");
          return;
        });
    }
  }

  renderMarkers = () => {
    if (this.state.showDirections) {
      return (
        <MapView.Marker
          coordinate={this.state.destination}>
        </MapView.Marker>
      );
    }
    return null;
  };

  renderDirections = () => {
    if (this.state.showDirections) {
      return (
        <MapViewDirections
          origin={this.state.markerPosition}
          destination={this.state.destination}
          apikey={GOOGLE_MAPS_APIKEY}
          mode={"bicycling"}
          strokeWidth={6}
          strokeColor={"red"}
        />
      );
    }
    return null;
  }




  renderMessage = () => {
    if (this.state.showDirections) {
      return (
        <View style={styles.calloutView} >
          <Callout>
            <Text style={styles.calloutMessage}>
              {this.state.nextClassInfo}
            </Text>
          </Callout>
        </View>);
    }
    return null;
  }

  static LogOut = async () => {
    let token = await AsyncStorage.getItem(CONSTANTS.TOKEN_LOCATION);
    if (token) { /* token was found */
      let error = await AsyncStorage.removeItem(CONSTANTS.TOKEN_LOCATION);
      if (error) {
        console.log(error);
      }
    }

    let schedule = await AsyncStorage.getItem(CONSTANTS.SCHEDULE_LOCATION);
    if (schedule) { /* Schedule was found */
      let error = await AsyncStorage.removeItem(CONSTANTS.SCHEDULE_LOCATION);
      if (error) {
        console.log(error);
      }
    }

    CONSTANTS.MapScreenRef.actualInstance.goToLoginScreen();
  }

  pickDocument = async () => {
    let token = await AsyncStorage.getItem(CONSTANTS.TOKEN_LOCATION);
    if (!token) {
      Alert.alert("Please login!");
      this.goToLoginScreen();
    }


    const document = await Expo.DocumentPicker.getDocumentAsync(
      {
        type: "text/calendar",
        copyToCacheDirectory: true,
      }
    );

    if (document.type !== "success") {
      return;
    }

    this.setState({ loading: true });
    let fileData = await Expo.FileSystem.readAsStringAsync(document.uri);
    fetch(CONSTANTS.APP_URL + "/schedule", {
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
      if (res.status == 200) {
        let events = (await res.json()).events;
        await AsyncStorage.setItem(CONSTANTS.SCHEDULE_LOCATION, JSON.stringify(events));
        this.setState({ events: events.slice() });
        Alert.alert("File upload successful!");
      } else {
        let message = (await res.json()).message;
        Alert.alert(message);
      }
      this.setState({ loading: false });
    }).catch((err) => {
      this.setState({ loading: false });
      console.log(err);
      Alert.alert("Oops, something went wrong. Please try again.");
    });
  }



  getDistance = async () => {
    return NetInfo.isConnected.fetch().then(async (isConnected) => {
      if (!isConnected) {
        console.log(isConnected);
        Alert.alert("You are not connected to the internet");
        // this.setState({ loading: false });
      }
      else {
        let origin = this.state.initialPosition;
        let destination = this.state.destination;
        await fetch(this.formatDistanceCall(origin, destination), {
          method: "GET",
        }).then(this.handleDistanceResponse)
          .catch((error) => {
            
            console.log("Unable to connect to server. Error: " + error);
            Alert.alert("Unable to connect to server. Error: " + error);
            // this.setState({ loading: false });
          });
      }
    });
  }

  handleDistanceResponse = async (response) => {
    if (response.status == 200) {
      await response.json().then((Distance) => {
        if (Distance) {
          console.log(Distance);
          this.setState({
            distanceInfo:
            {
              time: Distance.rows[0].elements[0].duration.text,
              distance: Distance.rows[0].elements[0].distance.text
            }

          });
          Alert.alert(this.state.distanceInfo.time + " = duration" + this.state.distanceInfo.distance + " = distance");
        }
        else {
          Alert.alert("Unexpected Error, Please try again.");
        }
      });
    } else {
      Alert.alert("Cannot get walking distance ");
    }
  }

  formatDistanceCall = (origin, destination) => {
    console.log("origin = " + origin.latitude + " \n");
    console.log("destination = " + destination.latitude + " \n");
    return "https://maps.googleapis.com/maps/api/distancematrix/json?" + "mode=walking&"+  "origins=" + origin.latitude + "," +
      + origin.longitude + "&destinations=" + destination.latitude + "," + destination.longitude + "&key=" + GOOGLE_MAPS_APIKEY;
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




  // renderMarkers = (events) => {
  //   // const markers = events.map((event) => {
  //   //   <MapView.Marker
  //   //     coordinate={this.state.markerPosition}>
  //   //     <View style={styles.radius}>
  //   //       <View style={styles.marker} />
  //   //     </View>
  //   //   </MapView.Marker>
  //   // });
  // }

  renderMap = () => {
    if (!this.state.loading) {
      return (
        <MapView
          style={styles.map}
          region={this.state.initialPosition}
          showUserLocation={true}
          followsUserLocation={true}  >
          <MapView.Marker
            coordinate={this.state.markerPosition}>
            <View style={styles.radius}>
              <View style={styles.marker} />
            </View>
          </MapView.Marker>
          {this.renderDirections()}
          {this.renderMarkers()}
        </MapView>
      );
    }
    return null;
  }

  renderGoToNextClass = () => {
    return (
      <View style={styles.bottomView}>
        <Button
          title="Get Next Class"
          onPress={this.getDestination} />
      </View>
    );
  }

  renderUploadButton = () => {
    return (<TouchableOpacity
      style={styles.uploadButton}
      onPress={this.pickDocument}>
      <Icon name="ios-cloud-upload" size={30} color="#fff" />
      <Text style={styles.uploadMessage}>
        Upload
            </Text>
    </TouchableOpacity>);
  }


  renderLogOutButton = () => {
    return (<TouchableOpacity
      style={styles.LogOut}
      onPress={this.LogOut}>
      <Icon name="ios-home" size={30} color="#fff" />
      <Text style={styles.uploadMessage}>
        Log Out
            </Text>
    </TouchableOpacity>);
  }

  render() {
    return (
      <View style={styles.container}>
        {this.renderBusyIndicator()}
        {this.renderMap()}
        {this.renderUploadButton()}
        {this.renderGoToNextClass()}
        {this.renderMessage()}
        <Button
          title="Get distance Class"
          onPress={this.getDistance} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  radius: {
    height: 50,
    width: 50,
    borderRadius: 50 / 2,
    overflow: "hidden",
    backgroundColor: "rgba(0,122,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(0,122,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  marker: {
    height: 20,
    width: 20,
    borderWidth: 3,
    borderColor: "white",
    borderRadius: 20 / 2,
    overflow: "hidden",
    backgroundColor: "#007AFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    position: "absolute"
  },
  bottomView: {
    width: "100%",
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 10,
    backgroundColor: "rgba(255, 255, 255, 0.0)"
  },
  calloutView: {
    backgroundColor: "rgba(255, 255, 255, 0.65)",
    borderRadius: 10,
    width: "75%",
    height: 40,
    marginLeft: "30%",
    marginRight: "30%",
    marginTop: 20,
    top: 30,
    position: "absolute",
  },
  callout: {
    flexDirection: "row",
    marginLeft: "auto",
    alignSelf: "center",
    width: "100%"
  },
  calloutMessage: {
    borderColor: "transparent",
    marginLeft: 10,
    marginTop: 10,
    marginBottom: 10,
    marginRight: 10,
    height: 40,
    borderWidth: 0.0,
    textAlign: "center",
    fontWeight: "bold"
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,1)',
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 40,
    position: "absolute",
    top: 30,
    right: 10,
    backgroundColor: "#f4511e"
  },
  uploadMessage: {
    borderColor: "transparent",
    borderWidth: 0.0,
    textAlign: "center",
    fontSize: 8,
    color: "#fff"
  },
  LogOut: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,1)',
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 40,
    position: "absolute",
    top: 0,
    right: 10,
    backgroundColor: "#f4511e"
  },
  busyIndicator: {
    height: '100%',
    width: '100%',
    backgroundColor: "rgba(255, 255, 255, 0.3)"
  }
});
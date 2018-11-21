import React, {Component} from "react";
import MapView, { Callout } from "react-native-maps";
import Geocoder from "react-native-geocoding";
import MapViewDirections from "react-native-maps-directions";
import {
  StyleSheet,
  Text,
  View, Button, Alert, NetInfo
} from "react-native";
import { AsyncStorage } from "react-native";
import * as CONSTANTS from "./constants";

var ep = require("./eventProcessor.js");

const LATITUDEDELTA = 0.0122;
const LONGITUDEDELTA = .0221;
const GOOGLE_MAPS_APIKEY = "AIzaSyCvW9JtKWa3ftr-FD-bGsFqR9EBQMlGn7k";
Geocoder.init(GOOGLE_MAPS_APIKEY); // use a valid API key

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
      loading: false
    };
  }

  goToLoginScreen = () => {
    console.log("called gotologin");
    console.log(this.props.navigation.navigate);
    this.props.navigation.navigate("LoginScreen");
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


  getDestination = () => {

    NetInfo.isConnected.addEventListener('connectionChange', Function.prototype);

    NetInfo.isConnected.fetch().done((isConnected) => {

      if (!isConnected) {

        console.log(isConnected);
        Alert.alert("You are not connected to the internet");
      }
      else {
        AsyncStorage.getItem(CONSTANTS.TOKEN_LOCATION).then((token) => {
          fetch(CONSTANTS.APP_URL + "/schedule", {
            method: "GET",
            headers: {
              'x-auth-token': token
            }
          }).then((response) => {
            response.json().then((schedule) => {
              let allEvents = schedule.events;
              var nextEvent;
              let today = new Date();
              var todayClasses = allEvents.filter((event) => ep.isHappeningOnDay(event, today));
              console.log(todayClasses);
              let currentDate = new Date();
              nextEvent = null;
              let nextEventStartTime;
              if (todayClasses.length !== 0) {
                todayClasses.forEach((event) => {
                  let startTime = new Date(event.startTime);
                  if (nextEvent == null) {
                    if (startTime.getHours() >= currentDate.getHours()) {
                      nextEvent = event;
                      nextEventStartTime = new Date(nextEvent.startTime);
                    }
                    else if (startTime.getHours() === currentDate.getHours()) {
                      if (startTime.getMinutes() < currentDate.getMinutes()) {
                        nextEvent = event;
                        nextEventStartTime = new Date(nextEvent.startTime);
                      }
                    }
                  }
                  else if (startTime.getHours() < nextEventStartTime.getHours()) {
                    nextEvent = event;
                    nextEventStartTime = new Date(nextEvent.startTime);
                  }
                  else if (startTime.getHours() === nextEventStartTime.getHours()) {
                    if (startTime.getMinutes() < nextEventStartTime.getMinutes()) {
                      nextEvent = event;
                      nextEventStartTime = new Date(nextEvent.startTime);
                    }
                  }

                });
                if (!nextEvent) {
                  Alert.alert("Done for the day!");
                } else {
                  Geocoder.from(nextEvent.location)
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
                    .catch((error) => Alert.alert("Unexpected geocoder communication error, please try again."));
                }
              } else {
                Alert.alert("No classes today!");
              }
            });
          })
            .catch((error) => {
              console.log("Unable to connect to server. Error: " + error);
              Alert.alert("Unable to connect to server. Error: " + error);
            });
        })
      }
    });
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

  renderMap = () => {
    if(!this.state.loading) {
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

  render() {
    return (
      <View style={styles.container}>
        {this.renderMap()}
        {this.renderGoToNextClass()}
        {this.renderMessage()}
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
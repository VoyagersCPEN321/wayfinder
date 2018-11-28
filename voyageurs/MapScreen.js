import React, { Component } from "react";
import MapView from "react-native-maps";
import Geocoder from "react-native-geocoding";
import MapViewDirections from "react-native-maps-directions";
import {
  Platform,
  StyleSheet,
  Text,
  View, Button, Alert, NetInfo,
  TouchableOpacity,
  Modal, ActivityIndicator, BackHandler,
} from "react-native";
import { AsyncStorage } from "react-native";
import * as CONSTANTS from "./constants";
import CalendarScreen from './CalendarScreen.js';
import Icon from 'react-native-vector-icons/Ionicons'
import Expo from 'expo'

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
      //current location
      initialPosition: {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0,
        longitudeDelta: 0,
      },
      //destination marker
      markerPosition: {
        latitude: 0,
        longitude: 0,
      },
      //class location
      destination: {
        latitude: 49.2580,
        longitude: -123.253,
      },

      showDirections: false,
      nextClassInfo: null,
      loading: true,
      mapLoaded: false,
      gotUserLocation: false,
      events: [],
      distanceInfo: {
        time: null,
        distance: null
      }
    };

    NetInfo.isConnected.addEventListener('connectionChange', this.handleFirstConnectivityChange);
    this.init();
    CONSTANTS.MapScreenRef.actualInstance = this;
  }


  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', function () {
      BackHandler.exitApp();
      return true;
    });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
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

  //try to get schedule from local storage. Fetch from server if not available
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

  //getting current position for location tracking 
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
      this.setState({ gotUserLocation: true });
    }, (error) => alert(JSON.stringify(error)),
      { enableHighAccuracy: true, maximumAge: 1000 });

      if (Platform.OS === 'android') {
        Expo.Notifications.createChannelAndroidAsync('chat-messages', {
          name: 'Chat messages',
          sound: true,
        });
      }
  }

  //get the destination of the walking path for a route
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

  //retrieves the users schedule from the cloud server
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

  // takes the response from the cloud server and stores the users schedule locally
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

  //get the next immediate event and it's location
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
      await Geocoder.from(nextEvent.location)
        .then((json) => {
          var location = json.results[0].geometry.location;

          var destinationResult = {
            latitude: location.lat,
            longitude: location.lng,
          }

          this.setState({ destination: destinationResult });
        })
        .catch((error) => {
          Alert.alert("Unexpected geocoder communication error, please try again.");
          return;
        });
      await this.getDistance();
      this.setState({ showDirections: true });
      this.setState({
        nextClassInfo: {
          summary: nextEvent.summary,
          room: nextEvent.room,
          building: nextEvent.building
        }
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

  static pickDocument = async () => {
    let token = await AsyncStorage.getItem(CONSTANTS.TOKEN_LOCATION);
    if (!token) {
      Alert.alert("Please login!");
      CONSTANTS.MapScreenRef.actualInstance.goToLoginScreen();
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

    CONSTANTS.MapScreenRef.actualInstance.setState({ loading: true });
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
        CalendarScreen.updateSchedule();
        // let calendarScreen = CONSTANTS.CalendarScreenRef.actualInstance;
        // CONSTANTS.MapScreenRef.actualInstance.setState({ events: events.slice() });
        // if(CONSTANTS.CalendarScreenRef.actualInstance 
        //   && CONSTANTS.CalendarScreenRef.actualInstance.init) {
        //     console.log("updating the schedule");
        //   CONSTANTS.CalendarScreenRef.actualInstance.setState({ refreshing: true });
        //   await CONSTANTS.CalendarScreenRef.actualInstance.init();
        //   let lastDayCalled = CONSTANTS.CalendarScreenRef.actualInstance.state.lastDayCalled
        //   if(lastDayCalled) {
        //     CONSTANTS.CalendarScreenRef.actualInstance.loadItems(lastDayCalled).then(() => {
        //       CONSTANTS.CalendarScreenRef.actualInstance.setState({ refreshing: false });
        //     });
        //   }
        // }
        Alert.alert("File upload successful!");
        CONSTANTS.MapScreenRef.actualInstance.setState({ showDirections: false });

      } else {
        let message = (await res.json()).message;
        Alert.alert(message);
      }
      CONSTANTS.MapScreenRef.actualInstance.setState({ loading: false });
    }).catch((err) => {
      CONSTANTS.MapScreenRef.actualInstance.setState({ loading: false });
      console.log(err);
      Alert.alert("Oops, something went wrong. Please try again.");
    });
  }

  getDistance = async () => {
    return NetInfo.isConnected.fetch().then(async (isConnected) => {
      if (!isConnected) {
        console.log(isConnected);
        Alert.alert("You are not connected to the internet");
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
          });
      }
    });
  }

  handleDistanceResponse = async (response) => {
    if (response.status == 200) {
      await response.json().then((Distance) => {
        if (this.validateDistance(Distance)) {
          this.setState({
            distanceInfo:
            {
              time: Distance.rows[0].elements[0].duration.text,
              distance: Distance.rows[0].elements[0].distance.text
            }

          });
        }
      });
    }
  }

  validateDistance = (Distance) => {
    return Distance && Distance.rows &&
      Distance.rows.length && Distance.rows[0]
      && Distance.rows[0].elements
      && Distance.rows[0].elements.length
      && Distance.rows[0].elements[0].duration
      && Distance.rows[0].elements[0].distance;
  }

  formatDistanceCall = (origin, destination) => {
    console.log("origin = " + origin.latitude + " \n");
    console.log("destination = " + destination.latitude + " \n");
    return "https://maps.googleapis.com/maps/api/distancematrix/json?" + "mode=walking&" + "origins=" + origin.latitude + "," +
      + origin.longitude + "&destinations=" + destination.latitude + "," + destination.longitude + "&key=" + GOOGLE_MAPS_APIKEY;
  }



  renderBusyIndicator = () => {
    if (this.state.loading || !this.state.mapLoaded || !this.gotUserLocation) {
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

  renderMap = () => {
    if (!this.state.loading) {
      return (
        <MapView
          style={styles.map}
          region={this.state.initialPosition}
          showUserLocation={true}
          followsUserLocation={true}
          onMapReady={()=>{this.setState({ mapLoaded: true})}} >
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

  renderWalkingDistance() {
    if (this.state.showDirections && this.state.distanceInfo.time) {
      return (
        <View style={styles.distanceView} >
          <Icon name={'md-walk'} size={30} color="#fff" />
          <Text style={styles.distanceText}>
            {this.state.distanceInfo.time}
          </Text>
        </View>);
    }
    return null;
  }

  renderClassSummary() {
    if (this.state.showDirections && this.state.nextClassInfo && this.state.nextClassInfo.summary) {
      return (
        <View style={styles.classSummaryView} >
          <Text style={styles.classInfoText}>
            {this.state.nextClassInfo.summary}
          </Text>
        </View>);
    }
    return null;
  }

  renderBuildingName() {
    if (this.state.showDirections && this.state.nextClassInfo && this.state.nextClassInfo.building) {
      return (
        <View style={styles.buildingNameView} >
          <Text style={styles.classInfoText}>
            {this.state.nextClassInfo.building}
          </Text>
        </View>);
    }
    return null;
  }

  renderClassRoomNo() {
    if (this.state.showDirections && this.state.nextClassInfo && this.state.nextClassInfo.room) {
      return (
        <View style={styles.classRoomNoView} >
          <Text style={styles.classInfoText}>
            {this.state.nextClassInfo.room}
          </Text>
        </View>);
    }
    return null;
  }

  renderGoToNextClass = () => {
    return (
      <View style={styles.bottomView}>
          <TouchableOpacity onPress={this.getDestination} style={styles.goToNextClassParent}>
            <Text style={styles.goToNextClassText}> Go To Next Class </Text> 
          </TouchableOpacity>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        {this.renderBusyIndicator()}
        {this.renderMap()}
        {this.renderGoToNextClass()}
        {this.renderClassSummary()}
        {this.renderBuildingName()}
        {this.renderClassRoomNo()}
        {this.renderWalkingDistance()}
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
    width: '50%',
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: "7%",
    left: "25%",
    backgroundColor: "#4367b0",
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginLeft: 'auto',
    marginRight: 'auto',
    borderBottomRightRadius: 50,
    borderTopRightRadius: 50,
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
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
  },
  classSummaryView: {
    backgroundColor: "#f4511e",
    marginTop: 20,
    top: "2%",
    left: 0,
    position: "absolute",
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 10,
    paddingTop: 5,
    paddingBottom: 5,
    paddingRight: 20,
    borderBottomRightRadius: 50,
    borderTopRightRadius: 50,
  },
  classInfoText: {
    borderColor: "transparent",
    height: 'auto',
    width: 'auto',
    borderWidth: 0.0,
    textAlign: "center",
    fontWeight: "bold",
    flex: 1,
    color: "#fff"
  },
  classRoomNoView: {
    backgroundColor: "#f4511e",
    marginTop: 20,
    top: "14%",
    left: 0,
    position: "absolute",
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 10,
    paddingTop: 5,
    paddingBottom: 5,
    paddingRight: 20,
    borderBottomRightRadius: 50,
    borderTopRightRadius: 50,
  },
  buildingNameView: {
    backgroundColor: "#f4511e",
    marginTop: 20,
    top: "8%",
    left: 0,
    position: "absolute",
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 10,
    paddingTop: 5,
    paddingBottom: 5,
    paddingRight: 20,
    borderBottomRightRadius: 50,
    borderTopRightRadius: 50,
  },
  distanceView: {
    backgroundColor: "#f4511e",
    marginTop: 20,
    top: "20%",
    left: 0,
    position: "absolute",
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 10,
    paddingTop: 10,
    paddingBottom: 5,
    paddingRight: 20,
    borderBottomRightRadius: 50,
    borderTopRightRadius: 50,
  },
  distanceText: {
    borderColor: "transparent",
    height: 'auto',
    width: 'auto',
    borderWidth: 0.0,
    textAlign: "center",
    fontWeight: "bold",
    flex: 1,
    color: "#fff"
  },
  goToNextClassText: {
    borderColor: "transparent",
    height: 'auto',
    width: 'auto',
    marginLeft: 'auto',
    marginRight: 'auto',
    borderWidth: 0.0,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
    color: "#fff"
  },
  goToNextClassParent: {
    flex: 1,
    flexDirection: 'row',
  }
});
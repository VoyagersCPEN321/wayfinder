import React from 'react';
import MapView from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import MapViewDirections from 'react-native-maps-directions';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View, Button, Alert } from 'react-native';
  var timetable2 ='{"days":[{ "Courses":[{"courseTitle": "Econ 101", "building" : "brock hall", "address":"1874 E Mall, Vancouver, BC V6T 1Z1","startTime"  : "10:00","endTime"    : "12:00"}, {"courseTitle": "cpen 331", "building" : "Macleod", "address":"2356 Main Mall, Vancouver, BC V6T 1Z4","startTime"  : "12:00","endTime"    : "14:00"}] }]}';
  var obj = JSON.parse(timetable2);
var ep = require('./eventProcessor.js');


const LATITUDEDELTA =  0.0122
const LONGITUDEDELTA = .0221
const GOOGLE_MAPS_APIKEY = 'AIzaSyCvW9JtKWa3ftr-FD-bGsFqR9EBQMlGn7k'
Geocoder.init(GOOGLE_MAPS_APIKEY); // use a valid API key

export default class App extends React.Component {
  constructor(props){
    super(props)

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
      }
    }
  }
componentDidMount(){
  navigator.geolocation.getCurrentPosition((position) => {
    var lat = parseFloat(position.coords.latitude )
    var long = parseFloat(position.coords.longitude)

    var initialRegion = {
      latitude: lat,
      longitude: long,
      latitudeDelta: LATITUDEDELTA,
      longitudeDelta: LONGITUDEDELTA,
    }

    this.setState({initialPosition : initialRegion})
    this.setState({markerPosition: initialRegion})
  }, (error) => alert(JSON.stringify(error)),
    {enableHighAccuracy: true,  maximumAge: 1000})
}


// Fetch('https://mywebsite.com/endpoint/', {
//   method: 'POST',
//   headers: {
//     Accept: 'application/json',
//     'Content-Type': 'application/json',
//   },
//   body: JSON.stringify({
//     firstParam: 'yourValue',
//     secondParam: 'yourOtherValue',
//   }),
// }).then((response) => response.json())
//     .then((responseJson) => {
//       return responseJson.movies;
//     })
//     .catch((error) => {
//       console.error(error);
//     });


getDestination = () => {

  var allEvents;
    fetch('http://40.117.145.64:8080/getSchedule', {
      method: 'GET'
    }).then(response => {
     response.json().then((schedule) => {
          allEvents = schedule.events;
          var nextEvent;

          var todayClasses = allEvents.filter(event => ep.isHappeningToday(event));
          // works till hereee

          let currentDate = new Date();
          // console.log(currentDate.getDay());
          //console.log(todayClasses);
          nextEvent = null;

          let aTime = new Date();
          let bTime = new Date();
          let nextEventStartTime;
          if(!todayClasses.length  == 0){
            todayClasses.forEach((event)=>{
              let startTime = new Date(event.startTime);
              if(nextEvent == null){
                if(startTime.getHours() >=  currentDate.getHours() ){
                  nextEvent = event;
                  nextEventStartTime = new Date(nextEvent.startTime);
                }
                else if(startTime.getHours() == currentDate.getHours()){
                  if(startTime.getMinutes() < currentDate.getMinutes()){
                    nextEvent = event;
                    nextEventStartTime = new Date(nextEvent.startTime);
                  }
                }
              }
              else if(startTime.getHours() <  nextEventStartTime.getHours() ){
                nextEvent = event;
                nextEventStartTime = new Date(nextEvent.startTime);
              }
              else if(startTime.getHours() == nextEventStartTime.getHours()){
                if(startTime.getMinutes() < nextEventStartTime.getMinutes()){
                  nextEvent = event;
                  nextEventStartTime = new Date(nextEvent.startTime);
                }
              }

          });

          if(!nextEvent) {
            Alert.alert('Done for the day!');
          } else {
            console.log("balls");
            console.log(nextEvent);
            console.log("sack");

            Geocoder.from(nextEvent.location)
                .then(json => {
                  var location = json.results[0].geometry.location;
                  //Alert.alert(JSON.stringify(location));

                  console.log("geocoder values: ");
                  console.log(location.lat);
                  console.log(location.lng);

                  var destinationResult = {
                    latitude: location.lat,
                    longitude: location.lng,
                  }

                  this.setState({destination: destinationResult})

                  console.log("state values: ");
                  console.log("destination: " + this.state.destination.latitude);
                  console.log("destination: " + this.state.destination.longitude);
                })
                .catch(error => console.warn(error));


        }  else{
              Alert.alert('No classes today!');
          }
     });
 });

}
  render() {
    return (
      <View style={styles.container}>
      <MapView
        style={styles.map}
        region= {this.state.initialPosition}
        showUserLocation = {true}
        followsUserLocation = {true}  >
        <MapView.Marker
          coordinate = {this.state.markerPosition}>
            <View style={styles.radius}>
            <View style={styles.marker}/>
            </View>
        </MapView.Marker>
        <MapView.Marker
         coordinate = {this.state.destination}>

          </MapView.Marker>
          <MapViewDirections
            origin={this.state.markerPosition}
            destination={this.state.destination}
            apikey={GOOGLE_MAPS_APIKEY}
            mode={"bicycling"}
            strokeWidth={6}
            strokeColor={"red"}
            />
        </MapView>

        <View style={ styles.bottomView}>
                  <Button
                    title="Get Next Class"
                    onPress = {this.getDestination} />
                </View>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  radius: {
    height: 50,
    width: 50,
    borderRadius: 50/2,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,122,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    height:20,
    width: 20,
    borderWidth: 3,
    borderColor:'white',
    borderRadius: 20/2,
    overflow: 'hidden',
    backgroundColor: '#007AFF',


  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 80,
    position: 'absolute'
  },
  bottomView:{
    width: '100%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0
  }
});

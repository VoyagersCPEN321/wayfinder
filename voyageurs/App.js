import React from 'react';
import MapView from 'react-native-maps';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import Geocoder from 'react-native-geocoding';
var timetable2 ='{"days":[{ "Courses":[{"courseTitle": "Econ 101", "building" : "brock hall", "address":"1874 E Mall, Vancouver, BC V6T 1Z1","startTime"  : "10:00","endTime"    : "12:00"}, {"courseTitle": "cpen 331", "building" : "Macleod", "address":"2356 Main Mall, Vancouver, BC V6T 1Z4","startTime"  : "12:00","endTime"    : "14:00"}] }]}';
var obj = JSON.parse(timetable2);

// const timetable = require( './courses.json');
Geocoder.init('AIzaSyCvW9JtKWa3ftr-FD-bGsFqR9EBQMlGn7k'); // use a valid API key

// const timetableparsed = JSON.parse(this.timetable);
export default class App extends React.Component {

  // var date = new Date(new Date().toLocaleString());
  //
  // var day = date.getDay();
  // var minutes = date.getMinutes()
  // var hours = date.getHours() // 24 hour clock
  // const word = data.name;
  JsonReader = () => {
    Alert.alert(obj.days[0].Courses[1].building);
  }

  Geocoding


  render() {
    return (
      <View style={styles.container}>
      <Button title="hello"
      onPress = {this.JsonReader}
      />
{/*
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 49.2606,
          longitude: -123.2460,
          latitudeDelta: 0.0122,
          longitudeDelta: .0221,
        }}>
        <MapView.Marker
          coordinate = {{
            latitude: 49.2606,
            longitude: -123.2460,
          }}>

          {  /*<View style={styles.radius}>
            <View style={styles.marker}/>
            </View>   this code is for the starting location
            it shows a blue circle, without this code,
            it just shows a red marker
           </MapView.Marker>
        </MapView>
*/}

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
    bottom: 0,
    position: 'absolute'
  }
});

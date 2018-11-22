import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  AsyncStorage
} from "react-native";
import {Agenda } from 'react-native-calendars';
import * as CONSTANTS from "./constants";

export default class CalendarScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: {
        '2018-11-23': [{name: 'CPEN 311', time: '12:30 - 2:00', location: "McLeod 202"},
                       {name: 'ELEC 221', time: '3:30 - 5:00', location: "Kaiser 451"}]
      }
    };
  }

  static navigationOptions = {
    title: 'Calendar'
  };

  render() {
    console.log(new Date());
    this.getSchedule();

    return (
      <Agenda
        items={this.state.items}
        loadItemsForMonth={this.loadItems.bind(this)}
        selected={new Date()}
        renderItem={this.renderItem.bind(this)}
        renderEmptyDate={this.renderEmptyDate.bind(this)}
        rowHasChanged={this.rowHasChanged.bind(this)}
      />
    );
  }

  loadItems(day) {
    setTimeout(() => {
      for (let i = -15; i < 85; i++) {
        const time = day.timestamp + i * 24 * 60 * 60 * 1000;
        const strTime = this.timeToString(time);
        console.log(strTime);
        if (!this.state.items[strTime]) {
          this.state.items[strTime] = [];
          const numItems = Math.floor(Math.random() * 5);
          for (let j = 0; j < numItems; j++) {
            this.state.items[strTime].push({
              name: 'Item for ' + strTime,
              height: Math.max(50, Math.floor(Math.random() * 150))
            });
          }
        }
      }
      //console.log(this.state.items);
      const newItems = {};
      Object.keys(this.state.items).forEach(key => {newItems[key] = this.state.items[key];});
      this.setState({
        items: newItems
      });
    }, 1000);
    // console.log(`Load Items for ${day.year}-${day.month}`);
  }

  renderItem(item) {
    return (
      <View style={[styles.item, {height: item.height}]}>
        <Text>{item.name + "\n" + item.time + "\n" + item.location}</Text>
      </View>
    );
  }

  renderEmptyDate() {
    return (
      <View style={styles.emptyDate}><Text>Nothing today!</Text></View>
    );
  }

  rowHasChanged(r1, r2) {
    return r1.name !== r2.name;
  }

  timeToString(time) {
    const date = new Date(time);
    return date.toISOString().split('T')[0];
  }

  getSchedule = () => {

    //NetInfo.isConnected.addEventListener('connectionChange', Function.prototype);

    //this.setState({loading: true});
    //NetInfo.isConnected.fetch().done((isConnected) => {

      // if (!isConnected) {
      //   console.log(isConnected);
      //   Alert.alert("You are not connected to the internet");
      //   this.setState({loading: false});
      //}
      //else {
        AsyncStorage.getItem(CONSTANTS.TOKEN_LOCATION).then((token) => {
          fetch(CONSTANTS.APP_URL + "/schedule", {
            method: "GET",
            headers: {
              'x-auth-token': token
            }
          }).then(this.handleResponse)
            .catch((error) => {
              console.log("Unable to connect to server. Error: " + error);
              Alert.alert("Unable to connect to server. Error: " + error);
              this.setState({loading: false});
            });
        })
    //  }
    //});
  }

  handleResponse = (response) => {
    if (response.status == 200) {
      response.json().then((schedule) => {
        let allEvents = schedule.events;
        //console.log(allEvents);
        /*

        var nextEvent;
        let today = new Date();
        var todayClasses = allEvents.filter((event) => ep.isHappeningOnDay(event, today));
        let currentDate = new Date();
        nextEvent = null;
        let nextEventStartTime;
        if (todayClasses.length > 0) {
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
        } */
      });
    } else if (response.status == 404) {
      Alert.alert("Please upload your schedule.");
    } else {
      Alert.alert("Unexpected Error please try again.");
    }
    this.setState({loading: false});
  }

}

const styles = StyleSheet.create({
  item: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17
  },
  emptyDate: {
    height: 15,
    flex:1,
    paddingTop: 30
  }
});
  

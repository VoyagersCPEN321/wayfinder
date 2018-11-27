import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  AsyncStorage,
  Alert
} from "react-native";
import {Agenda } from 'react-native-calendars';
import * as CONSTANTS from "./constants";

var ep = require("./eventProcessor.js");

var dateFormat = require('dateformat');

export default class CalendarScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: {
        '2018-11-23': [{name: 'CPEN 311', time: '12:30 - 2:00', location: "McLeod 202"},
                       {name: 'ELEC 221', time: '3:30 - 5:00', location: "Kaiser 451"}]
      },
      events: []
    };

    this.init();
  }

  static navigationOptions = {
    title: 'Calendar'
  };

  init = async () => {
    let events = JSON.parse(await AsyncStorage.getItem(CONSTANTS.SCHEDULE_LOCATION));
    if (events) {
      this.setState({ events: events });
    } else {
      await this.fetchSchedule();
    }
    this.setState({ loading: false });
  }

  render() {
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
    let currentDay = new Date();
    let today = new Date();

    for (let i = -10; i < 10; i++) {
      //const time = day.timestamp + i * 24 * 60 * 60 * 1000;
      currentDay.setDate(today.getDate() + i);

      const strTime = dateFormat(currentDay, "yyyy-mm-dd");
      //console.log("strTime: " + strTime);
      //console.log("currentDay: " + currentDay);
      //console.log("currentDayFormatted: " + dateFormat(currentDay, "yyyy-mm-dd"));
      
      this.state.items[strTime] = [];

      let allEvents = this.state.events;

      var currentDayClasses = allEvents.filter((event) => ep.isHappeningOnDay(event, currentDay));

      currentDayClasses.forEach((event) => {

        //let month = today.getUTCMonth() + 1; //months from 1-12
        //let day = today.getUTCDate();
        //let year = today.getUTCFullYear();
        //console.log("date: " + year + "-" + month + "-" + day);

        let eventStartTime = new Date(event.startTime);
        let eventStartTimeFormatted = eventStartTime.getUTCHours() + ":" + eventStartTime.getUTCMinutes();
        //console.log("todays event start: " + eventStartTimeFormatted);

        let eventEndTime = new Date(event.endTime);
        let eventEndTimeFormatted = eventEndTime.getUTCHours() + ":" + eventEndTime.getUTCMinutes();
        //console.log("todays event end: " + eventEndTimeFormatted);

        this.state.items[strTime].push({
          //name: 'Class for ' + strTime,
          name: event.summary,
          time: eventStartTimeFormatted + " - " + eventEndTimeFormatted,
          location: event.location
        })

      });


    }
    
    const emptyTime = day.timestamp;
    const emptyStrTime = this.timeToString(emptyTime);
    if (!this.state.items[emptyStrTime]) {
      this.state.items[emptyStrTime] = [];
      this.state.items[emptyStrTime].push({
        name: 'Nothing today!',
        time: '',
        location: ''
      });
    }

    const newItems = {};
    Object.keys(this.state.items).forEach(key => {newItems[key] = this.state.items[key];});
    this.setState({
      items: newItems
    });
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

  fetchSchedule = async () => {
   /* return NetInfo.isConnected.fetch().then(async (isConnected) => {
      if (!isConnected) {
        console.log(isConnected);
        Alert.alert("You are not connected to the internet");
        this.setState({ loading: false });
      }
      else { */
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
    //  }
    //});
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
  

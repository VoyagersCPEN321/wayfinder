import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
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
      //event items that will be displayed in the calendar
      // map from string to array of events
      // eg. '2018-11-23': [{name: 'CPEN 311', time: '12:30 - 2:00', location: "McLeod 202"}]
      items: {
        null:null
      },
      //events from the schedule
      events: [],
      lastDayCalled: null,
      refreshing: false
    };

    this.init();
    CONSTANTS.CalendarScreenRef.actualInstance = this;
  }

  static navigationOptions = {
    title: 'Calendar'
  };

  //retrieve the schedule from storage and add it to state or call fetch if it's not present
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
    if(!this.state.refreshing) {
      return (
        <Agenda
          items={this.state.items}
          loadItemsForMonth={this.loadItems}
          selected={new Date()}
          renderItem={this.renderItem.bind(this)}
          renderEmptyDate={this.renderEmptyDate.bind(this)}
          rowHasChanged={this.rowHasChanged.bind(this)}
          refreshing={this.state.refreshing}
        />
      );
    }
    return null;
  }


static updateSchedule = async () => {
    let calendarScreen = CONSTANTS.CalendarScreenRef.actualInstance;
    if(calendarScreen && calendarScreen.init) {
      calendarScreen.setState({ refreshing: true });
      await calendarScreen.init();
      let lastDayCalled = calendarScreen.state.lastDayCalled
      if(lastDayCalled) {
        calendarScreen.loadItems(lastDayCalled).then(() => {
          calendarScreen.setState({ refreshing: false });
        });
      }
    }
  }

  loadItems = async (day) => {
    let currentDay = new Date();
    let today = new Date();
    this.setState({ lastDayCalled: day });
    for (let i = -20; i < 20; i++) {

      currentDay.setDate(today.getDate() + i);
      const strTime = dateFormat(currentDay, "yyyy-mm-dd");
      
      //current date string mapped to array of events in state
      this.state.items[strTime] = [];
      let allEvents = this.state.events;
      var currentDayClasses = allEvents.filter((event) => ep.isHappeningOnDay(event, currentDay));

      currentDayClasses.forEach((event) => {

        let eventStartTime = new Date(event.startTime);

        //this is for assembling the class start times and end times that will 
        //be displayed in calendar entries
        let eventStartTimeHours = eventStartTime.getUTCHours();
        if(eventStartTimeHours <= 9){
          eventStartTimeHours = "0" + eventStartTimeHours;
        }

        let eventStartTimeMinutes = eventStartTime.getUTCMinutes();
        if(eventStartTimeMinutes <= 9){
          eventStartTimeMinutes = "0" + eventStartTimeMinutes;
        }

        let eventStartTimeFormatted = eventStartTimeHours + ":" + eventStartTimeMinutes;

        let eventEndTime = new Date(event.endTime);

        let eventEndTimeHours = eventEndTime.getUTCHours();
        if(eventEndTimeHours <= 9){
          eventEndTimeHours = "0" + eventEndTimeHours;
        }

        let eventEndTimeMinutes = eventEndTime.getUTCMinutes();

        if(eventEndTimeMinutes <= 9){
          eventEndTimeMinutes = "0" + eventEndTimeMinutes;
        }

        let eventEndTimeFormatted = eventEndTimeHours + ":" + eventEndTimeMinutes;

        //add the assembled calendar event to the current date
        this.state.items[strTime].push({
          name: event.summary,
          time: eventStartTimeFormatted + " - " + eventEndTimeFormatted,
          location: event.building  + " " + event.room
        })

      });

      //sorts all events on this date from earliest to latest for display
      this.state.items[strTime].sort((a, b)=>{
        return a.time.split(" - ")[0] > b.time.split(" - ")[0];
      });

    }
    
    //handles when a day is pressed on the calendar and there are not any classes 
    // displayed. It is filled with a placeholder event on that day
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

  //display a class event with its information
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

  //used for the key values in the events object in state
  timeToString(time) {
    const date = new Date(time);
    return date.toISOString().split('T')[0];
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
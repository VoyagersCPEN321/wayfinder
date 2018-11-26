var moment = require('moment-timezone');
// TODO add a frontend model class to match IEvent on the backend
function isBeforeYear(a, b) {
  if (b.getFullYear() > a.getFullYear()) {
    return true;
  }
  return false;
}

function isBeforeMonth(a, b) {
  if (b.getMonth() > a.getMonth()) {
    return true;
  }
  return false;
}

/*
 * Checks if a is before b in a day level comparison.
 */
function isBeforeDay(a, b) {
  if (b.getFullYear() !== a.getFullYear()) {
    return isBeforeYear(a, b);
  }
  if (b.getMonth() !== a.getMonth()) {
    return isBeforeMonth(a, b);
  }
  if (b.getDate() > a.getDate()) {
    return true;
  }
  return false;
}

function dayToUTCDay(day) {
  switch (day) {
    case "SU": return 0;
    case "MO": return 1;
    case "TU": return 2;
    case "WE": return 3;
    case "TH": return 4;
    case "FR": return 5;
    case "SA": return 6;
    default: throw new Error("Invalid day");
  }
}

export function isHappeningOnDay(event, date) {
  if (!event) {
    throw new Error("null event");
  }
  /* Check if the event's first occurence hasn't occurred yet. */
  var startDay = convertToLocalDate(event.startDay);
  var lastDay = convertToLocalDate(event.lastDay);
  if (isBeforeDay(date, startDay)) {
    if(event.summary == "CPSC 320 202") {
      console.log("CPSC:    isBeforeDay : true");
    }
    return false;
  }
  /* Check if the event's last occurrence already passed */
  if (isBeforeDay(lastDay, date)) {
    if(event.summary == "CPSC 320 202") {
      console.log("CPSC:    isBeforeDay2 : true");
    }
    return false;
  }

  /* We know the event is within its ocurrence range */
  if (date.getDay() !== dayToUTCDay(event.day)) {
    if(event.summary == "CPSC 320 202") {
      console.log("CPSC:    not equal day : true");
    }
    return false;
  }
  // TODO check for non weekly recurrence, for now assume all events are weekly
  if(event.summary == "CPSC 320 202") {
    console.log("CPSC: -----passsed");
    console.log("Start day: "+event.summary+ "  " + startDay);
    console.log("Last day: "+event.summary+ "  " + lastDay);
    console.log(startDay.getDay());
    console.log(startDay.getMonth());
    console.log(startDay.getYear());
  }
  return true;
}

/* Assumes that the event has already been checked to be happening today. */
function isHappeningRightNow(event) {
  let currentDate = moment().tz(VANCOUVER_TZ).toDate();
  let currentHour = currentDate.getUTCHours();

  let eventStartTime = convertToLocalDate(event.startTime);
  let eventStartHour = eventStartTime.getUTCHours();

  let eventEndTime = convertToLocalDate(event.endTime);
  let eventEndHour = eventEndTime.getUTCHours();
  if (eventStartHour <= currentHour && eventEndHour >= currentHour ) {
    let currentMinutes = currentDate.getMinutes();
    /* event's duration is less than or equal 1hr. */
    if(eventStartHour === eventEndHour) {
      return currentMinutes >= eventStartTime.getMinutes()
      && currentMinutes < eventEndTime.getMinutes();
    } else {
      /* Event duration is more than 1 hr. */
      return currentHour === eventStartHour && currentMinutes >= eventStartTime.getMinutes()
      || currentHour === eventEndHour && currentMinutes < eventEndTime.getMinutes() 
      || currentHour < eventEndHour;
    }
  }
  return false;
}

export function getNextClass(events) {
  let eventsGoingOnRightNow = events.filter(event => isHappeningRightNow(event));
  if(eventsGoingOnRightNow.length == 1) {
    return eventsGoingOnRightNow[0];
  } else if(eventsGoingOnRightNow.length > 1) {
    console.log("Multiple events happening at the same time ....");
    let eventsNames = ''; 
    eventsGoingOnRightNow.forEach(event => {
      eventsNames += event.summary + "\n";
    });
    throw Error("You have multiple events right now:\n" + eventsNames);
  }

  let nextEvent = null;
  let nextEventStartTime;
  let currentDate = moment().tz(VANCOUVER_TZ).toDate();
  events.forEach((event) => {
    let startTime = convertToLocalDate(event.startTime);
    if (nextEvent == null) {
      if (startTime.getUTCHours() >= currentDate.getHours()) {
        nextEvent = event;
        nextEventStartTime = convertToLocalDate(nextEvent.startTime);
      }
      else if (startTime.getUTCHours() === currentDate.getHours()) {
        if (startTime.getMinutes() <= currentDate.getMinutes()) {
          nextEvent = event;
          nextEventStartTime = convertToLocalDate(nextEvent.startTime);
        }
      }
    }
    else if (startTime.getUTCHours() < nextEventStartTime.getUTCHours()) {
      nextEvent = event;
      nextEventStartTime = convertToLocalDate(nextEvent.startTime);
    }
    else if (startTime.getUTCHours() === nextEventStartTime.getUTCHours()) {
      if (startTime.getMinutes() < nextEventStartTime.getMinutes()) {
        nextEvent = event;
        nextEventStartTime = convertToLocalDate(nextEvent.startTime);
      }
    }
  });
  return nextEvent;
}

const VANCOUVER_TZ = "America/Vancouver";
export function convertToLocalDate(timeString) {
  return moment(timeString).tz(VANCOUVER_TZ).toDate();//new Date(timeString);
}

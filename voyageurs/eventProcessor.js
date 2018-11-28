var moment = require('moment-timezone');

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

function isHappeningOnDay(event, date) {
  if (!event) {
    throw new Error("null event");
  }
  /* Check if the event's first occurence hasn't occurred yet. */
  var startDay = convertToLocalDate(event.startDay);
  var lastDay = convertToLocalDate(event.lastDay);
  if (isBeforeDay(date, startDay)) {
    return false;
  }
  /* Check if the event's last occurrence already passed */
  if (isBeforeDay(lastDay, date)) {
    return false;
  }

  /* We know the event is within its ocurrence range */
  if (date.getDay() !== dayToUTCDay(event.day)) {
    return false;
  }
  // TODO check for non weekly recurrence, for now assume all events are weekly
  return true;
}

/* Assumes that the event has already been checked to be happening today. */
function isHappeningRightNow(event) {
  let currentDate = moment().tz(VANCOUVER_TZ).toDate();
  let currentHour = currentDate.getHours();

  let eventStartTime = convertToLocalDate(event.startTime);
  let eventStartHour = eventStartTime.getUTCHours();

  let eventEndTime = convertToLocalDate(event.endTime);
  let eventEndHour = eventEndTime.getUTCHours();
  if (eventStartHour <= currentHour && eventEndHour >= currentHour) {
    let currentMinutes = currentDate.getMinutes();
    /* event's duration is less than or equal 1hr. */
    if (eventStartHour === eventEndHour) {
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

function getUpcomingEvents(events) {
  let currentDate = moment().tz(VANCOUVER_TZ).toDate();
  return events.filter((event) => {
    let startTime = convertToLocalDate(event.startTime);
    return startTime.getUTCHours() >= currentDate.getHours();
  });
}

function getNextClass(events) {
  let eventsGoingOnRightNow = events.filter(event => isHappeningRightNow(event));
  if (eventsGoingOnRightNow.length == 1) {
    return eventsGoingOnRightNow[0];
  } else if (eventsGoingOnRightNow.length > 1) {
    console.log("Multiple events happening at the same time ....");
    let eventsNames = '';
    eventsGoingOnRightNow.forEach(event => {
      eventsNames += event.summary + "\n";
    });
    throw Error("You have multiple events right now:\n" + eventsNames);
  }

  let nextEvent = null;
  let nextEventStartTime = null;
  let upcomingEventsToday = getUpcomingEvents(events);
  upcomingEventsToday.forEach((event) => {
    let startTime = convertToLocalDate(event.startTime);
    /* If it is the first iteration just take the first item. */
    if (nextEvent == null) {
      nextEvent = event;
      nextEventStartTime = convertToLocalDate(nextEvent.startTime);
    }
    /* If the current event is happening before nextEvent, select it instead. */
    else if (startTime.getUTCHours() < nextEventStartTime.getUTCHours()) {
      nextEvent = event;
      nextEventStartTime = convertToLocalDate(nextEvent.startTime);
    } else if (startTime.getUTCHours() === nextEventStartTime.getUTCHours()
      && startTime.getMinutes() < nextEventStartTime.getMinutes()) {
      nextEvent = event;
      nextEventStartTime = convertToLocalDate(nextEvent.startTime);
    }
  });
  return nextEvent;
}

const VANCOUVER_TZ = "America/Vancouver";
function convertToLocalDate(timeString) {
  return moment(timeString).tz(VANCOUVER_TZ).toDate();//new Date(timeString);
}
module.exports = {
  isHappeningOnDay, isHappeningRightNow,
  getNextClass, convertToLocalDate
}

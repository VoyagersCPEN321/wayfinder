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
  if (b.getFullYear() !== a.getFullYear) {
    return isBeforeYear(a, b);
  }
  if (b.getMonth() !== a.getMonth()) {
    return isBeforeMonth(a, b);
  }
  if (b.getDay() > a.getDay()) {
    return true;
  }
  return false;
}

function dayToUTCDay(day) {
  switch (day) {
    case "MO": return 1;
    case "TU": return 2;
    case "WE": return 3;
    case "TH": return 4;
    case "FR": return 5;
    case "SA": return 6;
    case "SU": return 7;
    default: throw new Error("Invalid day");
  }
}

function isHappeningOnDay(event, date) {
  if (!event) {
    throw new Error("null event");
  }
  /* Check if the event's first occurence hasn't occurred yet. */
  var startDay = new Date(event.startDay);
  var lastDay = new Date(event.lastDay);

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
  let currentDate = new Date();
  let currentHour = currentDate.getHours();

  let eventStartTime = new Date(event.startTime);
  let eventStartHour = eventStartTime.getHours();

  let eventEndTime = new Date(event.endTime);
  let eventEndHour = eventEndTime.getHours();

  if (eventStartHour == currentHour || eventEndHour == currentHour) {
    let currentMinutes = currentDate.getMinutes();
    /* event's duration is less than or equal 1hr. */
    if(eventStartHour === eventEndHour) {
      return currentMinutes >= eventStartTime.getMinutes()
      && currentMinutes < eventEndTime.getMinutes();
    } else {
      /* Event duration is more than 1 hr. */
      return currentHour === eventStartHour && currentMinutes >= eventStartTime.getMinutes()
      || currentHour === eventEndHour && currentMinutes < eventEndTime.getMinutes();
    }
  }
  return false;
}

function getNextClass(events) {
  let nextEvent = null;
  let nextEventStartTime;
  let currentDate = new Date();
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
  events.forEach((event) => {
    let startTime = new Date(event.startTime);
    if (nextEvent == null) {
      if (startTime.getHours() >= currentDate.getHours()) {
        nextEvent = event;
        nextEventStartTime = new Date(nextEvent.startTime);
      }
      else if (startTime.getHours() === currentDate.getHours()) {
        if (startTime.getMinutes() <= currentDate.getMinutes()) {
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
  return nextEvent;
}

module.exports =  { 
  isHappeningOnDay, isHappeningRightNow, getNextClass
 }
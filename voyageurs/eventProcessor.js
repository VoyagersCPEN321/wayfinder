// TODO add a frontend model class to match IEvent on the backend
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

function isBeforeYear(a, b) {
  if (b.getFullYear() > a.getFullYear) {
    return true;
  }
  if (b.getFullYear() < a.getFullYear) {
    return false;
  }
}

function isBeforeMonth(a, b) {
  if (b.getMonth() > a.getMonth()) {
    return true;
  }
  if (b.getMonth() < a.getMonth()) {
    return false;
  }
}

function dayToUTCDay(day) {

  dict = { "MO": 1, "TU": 2, "WE": 3, "TH": 4, "FR": 5, "SA": 6, "SU": 7 };

  if (dict[day]) {
    return dict[day];
  }

  throw new Error("Invalid day");
}

export function isHappeningToday(event) {
  let today = new Date();
  if (!event) {
    throw new Error("null event");
  }
  /* Check if the event's first occurence hasn't occurred yet. */
  var startDay = new Date(event.startDay);
  var lastDay = new Date(event.lastDay);

  if (isBeforeDay(today, startDay)) {
    return false;
  }
  /* Check if the event's last occurrence already passed */
  if (isBeforeDay(lastDay, today)) {
    return false;
  }

  /* We know the event is within its ocurrence range */
  if (today.getDay() !== dayToUTCDay(event.day)) {
    return false;
  }
  // TODO check for non weekly recurrence, for now assume all events are weekly
  return true;
}

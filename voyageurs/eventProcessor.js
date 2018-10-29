// TODO add a frontend model class to match IEvent on the backend
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
    case "MU": return 1;
    case "TU": return 2;
    case "WE": return 3;
    case "TH": return 4;
    case "FR": return 5;
    case "SA": return 6;
    case "SU": return 7;
    default: throw new Error("Invalid day");
  }
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

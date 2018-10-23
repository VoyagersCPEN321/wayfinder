// TODO add a frontend model class to match IEvent on the backend
export function isHappeningToday(event) {
    let today = new Date();
    if(!event) throw new Error("null event");
    /* Check if the event's first occurence hasn't occurred yet. */
    if (isBeforeDay(today, event.startDay)) return false;
    /* Check if the event's last occurrence already passed */
    if (isBeforeDay(event.startDay, today)) return false;

    /* We know the event is within its ocurrence range */
    if (today.getDay() !== dayToUTCDay(event.day)) return false;
    // TODO check for non weekly recurrence, for now assume all events are weekly
    return true;
}

/*
 * Checks if a is before b in a day level comparison.
 */
function isBeforeDay(a, b) {
    return b.getDate() > a.getDate()
        && b.getMonth() >= a.getMonth()
        && b.getFullYear() >= a.getFullYear()
};

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
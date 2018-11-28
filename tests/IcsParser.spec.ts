import 'mocha';
import { expect } from 'chai';
import fs = require('fs');
import Parser from '../src/parsing/IcsParser';
import { IEvent } from '../src/models/event';

const ICS_FOOTER = `\nEND:VCALENDAR`;
describe('Invalid ics', () => {

    before(() => {
        this.validData = fs.readFileSync('./tests/validCal.ics', 'utf8');
    });

    it(`should throw an error if some events don't have frequency`, () => {
        let invalidCal: string = this.validData + `
BEGIN:VEVENT
DTSTAMP:20181016T013936Z
RRULE:WKST=MO;UNTIL=20190405T235959;INTERVAL=1;BYDAY=FR
SUMMARY:ELEC 331 T2A
LOCATION:MacLeod\, Room 202
DESCRIPTION:
DTSTAMP:20181016T013936Z
UID:12341539653976599abcd263820
DTSTART;TZID=America/Vancouver:20190104T100000
DTEND;TZID=America/Vancouver:20190104T120000
END:VEVENT` + ICS_FOOTER;
        expect(() => Parser.parseICS(invalidCal)).to.throw('Invalid ics file,some event(s) have no frequency.');
    });

    it('should return N/A if location is unspecified', () => {
        let noLocationsICS = this.validData + `
BEGIN:VEVENT
DTSTAMP:20181016T013936Z
RRULE:FREQ=WEEKLY;WKST=MO;UNTIL=20190405T235959;INTERVAL=1;BYDAY=FR
SUMMARY:ELEC 331 T2A
DESCRIPTION:
DTSTAMP:20181016T013936Z
UID:12341539653976599abcd263820
DTSTART;TZID=America/Vancouver:20190104T100000
DTEND;TZID=America/Vancouver:20190104T120000
END:VEVENT` + ICS_FOOTER;
        let targetEvent = Parser.parseICS(noLocationsICS).filter((event: IEvent) => {
            return event.location === 'N/A'
        });
        expect(targetEvent).to.have.lengthOf(1);
        expect((targetEvent[0] as IEvent).summary === 'ELEC 331 T2A');
    });

    it('should return N/A for room when location has an irregular pattern', () => {
        let weirdLocationIcs = this.validData + `
BEGIN:VEVENT
DTSTAMP:20181016T013936Z
RRULE:FREQ=WEEKLY;WKST=MO;UNTIL=20190405T235959;INTERVAL=1;BYDAY=FR
SUMMARY:ELEC 331 T2A
LOCATION:MacLeod, Romieee 202
DESCRIPTION:
DTSTAMP:20181016T013936Z
UID:12341539653976599abcd263820
DTSTART;TZID=America/Vancouver:20190104T100000
DTEND;TZID=America/Vancouver:20190104T120000
END:VEVENT` + ICS_FOOTER;

        let targetEvent = Parser.parseICS(weirdLocationIcs).filter((event: IEvent) => {
            return event.room === 'N/A'
        });
        expect(targetEvent).to.have.lengthOf(1);
        expect((targetEvent[0] as IEvent).summary === 'ELEC 331 T2A');
        expect((targetEvent[0] as IEvent).location === 'Macloed');
    });

    it('should throw an error for null icsContent', () => {
        expect(() => Parser.parseICS(null)).to.throw('Null calendar data.');
    });

    it('should throw an error if file has no events', () => {
        let noEventsIcal = 
`BEGIN:VCALENDAR
END:VCALENDAR`;
        expect(() => Parser.parseICS(noEventsIcal)).to.throw('No Events found in file.');
    });

    it('should throw an error if file is invalid', () => {
        let invalidIcs = `jdfhkasjdhfasdkjlhfksahklsahjfkadls`;
        expect(() => Parser.parseICS(invalidIcs)).to.throw('Invalid ICS file');
    });

    it('should throw an error if file is invalid', () => {
        let invalidIcs = `jdfhkasjdhfasdkjlhfksahklsahjfkadls`;
        expect(() => Parser.parseICS(invalidIcs)).to.throw('Invalid ICS file');
    });

    it('should return location name if location is ill formatted' , () => {
        let weirdLocationIcs = this.validData + `
BEGIN:VEVENT
DTSTAMP:20181016T013936Z
RRULE:FREQ=WEEKLY;WKST=MO;UNTIL=20190405T235959;INTERVAL=1;BYDAY=FR
SUMMARY:ELEC 331 T2A
LOCATION:MacLeodsssssssssssss
DESCRIPTION:
DTSTAMP:20181016T013936Z
UID:12341539653976599abcd263820
DTSTART;TZID=America/Vancouver:20190104T100000
DTEND;TZID=America/Vancouver:20190104T120000
END:VEVENT` + ICS_FOOTER;
        console.log(Parser.parseICS(weirdLocationIcs));
        let targetEvent = Parser.parseICS(weirdLocationIcs).filter((event: IEvent) => {
            return event.location === 'MacLeodsssssssssssss'
        });

        expect(targetEvent).to.have.lengthOf(1);
        expect((targetEvent[0] as IEvent).summary === 'ELEC 331 T2A');
        expect((targetEvent[0] as IEvent).location === 'Macloed');
    } )
});

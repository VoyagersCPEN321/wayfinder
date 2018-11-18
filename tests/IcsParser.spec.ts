import 'mocha';
import { expect } from 'chai';
import fs = require('fs');
import Parser from '../src/parsing/IcsParser';

describe('Invalid ics', () => {

    before(() => {
        this.validData = fs.readFileSync('./tests/validCal.ics', 'utf8');
    });

    it(`should throw an error if some events don't have frequency`, () => {
        let invalidCal: string = this.validData + 
        `BEGIN:VEVENT
DTSTAMP:20181016T013936Z
RRULE:WKST=MO;UNTIL=20181126T235959;INTERVAL=1;BYDAY=MO
SUMMARY:CPEN 321 101
LOCATION:MacLeod\, Room 202
DESCRIPTION:
DTSTAMP:20181016T013936Z
UID:12341539653976598abcd516327
DTSTART;TZID=America/Vancouver:20180903T150000
DTEND;TZID=America/Vancouver:20180903T163000
END:VEVENT`;
console.log(invalidCal);
        expect(Parser.parseICS).to.throw('Invalid ics file,some event(s) have no frequency.');
        Parser.parseICS(invalidCal);
    });
});


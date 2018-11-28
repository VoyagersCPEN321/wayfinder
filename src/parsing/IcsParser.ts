"use strict";

/*
 * Unfortunately it has no available typedef file
 * so check the API here http://mozilla-comm.github.io/ical.js/api/.
 */
import * as ICAL from "ical.js";
import * as mongoose from "mongoose";
import EVENT from "../models/event";
import locationsMap from "./locationsMap";

/*
 * Parses a given string in ICS representation
 * to an array of events that can be later
 * manipulated and persisted.
 */
export class IcsParser {
    private VEVENT_SELECTOR: string = "vevent";
    /**
     * Parses ics files and transforms them into Event objects.
     * @param icsContent data to parse
     */
    public parseICS(icsContent: string): mongoose.Document[] {
        if (icsContent == null) {
            throw new ReferenceError("Null calendar data.");
        }
        let schedule = this.getMainComponent(icsContent);
        let allEvents: mongoose.Document[] = [];
        let parsedEvents: [] = schedule.getAllSubcomponents(this.VEVENT_SELECTOR);
        if (parsedEvents.length === 0) {
            throw new ReferenceError("No Events found in file.");
        }
        parsedEvents.forEach(event => {
            allEvents.push(this.createEvent(event));
        });
        return allEvents;
    }

    /**
     *  Extracts the important info through the ical library.
     */
    private getMainComponent(icsContent: string): any {
        try {
            var icalData = ICAL.parse(icsContent);
            return new ICAL.Component(icalData);
        } catch (e) {
            throw new Error("Invalid ICS file");
        }
    }

    private SUMMARY_SELECTOR: string = "summary";
    private RULE_SELECTOR: string = "rrule";
    private LOCATION_SELECTOR: string = "location";
    private DESCRIPTION_SELECTOR: string = "description";
    private START_DATE_SELECTOR: string = "dtstart";
    private END_DATE_SELECTOR: string = "dtend";

    private createEvent(parsedEvent: any): mongoose.Document {
        let summary: string = parsedEvent.getFirstPropertyValue(this.SUMMARY_SELECTOR);
        let rules: any = parsedEvent.getFirstPropertyValue(this.RULE_SELECTOR);
        let day: string = rules.parts.BYDAY[0];

        /* Location related fields */
        let fullICSLocation = parsedEvent.getFirstPropertyValue(this.LOCATION_SELECTOR);
        let location: string;
        let room: string;
        let building: string;
        if (fullICSLocation == null) {
            location = this.NOT_AVAILABLE;
            room = this.NOT_AVAILABLE;
            building = this.NOT_AVAILABLE;
        } else {
            location = this.getAddress(fullICSLocation.slice());
            room = this.extractRoom(fullICSLocation.slice());
            building = this.getBuildingName(fullICSLocation.slice()) || this.NOT_AVAILABLE;
        }

        let description: string = parsedEvent.getFirstPropertyValue(this.DESCRIPTION_SELECTOR);
        /* Timing related fields. */
        let startTime: Date = new Date(parsedEvent.getFirstPropertyValue(this.START_DATE_SELECTOR));
        let endTime: Date = new Date(parsedEvent.getFirstPropertyValue(this.END_DATE_SELECTOR));
        let startDay: Date = new Date(parsedEvent.getFirstPropertyValue(this.START_DATE_SELECTOR));
        let lastDay: Date = new Date(rules.until);
        let frequency: string = rules.freq;
        if (frequency == null) {
            throw new Error("Invalid ics file, some event(s) have no frequency.");
        }
        let recurrence: number = rules.interval;

        return new EVENT.MODEL({
            summary: summary,
            day: day,
            location: location,
            room: room,
            building: building,
            description: description,
            startTime: startTime,
            endTime: endTime,
            startDay: startDay,
            lastDay: lastDay,
            frequency: frequency,
            recurrence: recurrence
        });
    }

    private NOT_AVAILABLE: string = "N/A";
    /**
     * Extracts the room string: 'Room 202'
     * from the location string in the ics file.
     */
    private extractRoom(location: string) {
        let roomPtrn = new RegExp('Room.*');
        let roomMatches = location.match(roomPtrn);
        if (!roomMatches || roomMatches.length === 0) {
            return this.NOT_AVAILABLE;
        }
        return roomMatches[0];
    }

    private LOCATION_SPECIFIER: string = ", Vancouver, BC, CA";
    /**
     * Extracts the building from the location string
     * in the ics file and then attempts to transform it
     * into an actual address.
     */
    private getAddress(location: string): string {
        let buildingName = this.getBuildingName(location);
        if (!buildingName) {
            return location || this.NOT_AVAILABLE;
        }

        let actualAddress: string = locationsMap.getAddress(buildingName);
        if (actualAddress) {
            return actualAddress + this.LOCATION_SPECIFIER;
        }
        return buildingName + this.LOCATION_SPECIFIER;
    }

    /**
     * Extracts the building string: 'Macleod'
     * from the location string in the ics file.
     */
    private getBuildingName(location: string) {
        let tokens = location.split(',');
        if (tokens.length <= 1) {
            return null;
        }
        return tokens[0].trim();
    }
}

export default new IcsParser();
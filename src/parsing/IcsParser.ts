"use strict";

/*
 * Unfortunately it has no available typedef file
 * so check the API here http://mozilla-comm.github.io/ical.js/api/.
 */
import * as ICAL from "ical.js";
import * as mongoose from "mongoose";
import EVENT from "../models/event";
import fs = require('fs');
import { resolve } from "path";
import locationsMap from "./locationsMap";

/*
 * Parses a given string in ICS representation
 * to an array of events that can be later
 * manipulated and persisted.
 */
export class IcsParser {
    private VEVENT_SELECTOR: string = "vevent";
    public parseICS(icsContent: string): mongoose.Document[] {
        if (icsContent == null) {
            throw new ReferenceError("null calendar data");
        }
        try {
            // TODO remove when done testing
            let icalData = ICAL.parse(fs.readFileSync('ical-2.ics', 'utf8'));
            let schedule = new ICAL.Component(icalData);
            let allEvents: mongoose.Document[] = [];
            let parsedEvents: [] = schedule.getAllSubcomponents(this.VEVENT_SELECTOR);
            if (parsedEvents.length === 0) {
                throw new ReferenceError("No Events found in file.");
            }
            parsedEvents.forEach(event => {
                allEvents.push(this.createEvent(event));
            });
            return allEvents;
        } catch (e) {
            throw e;
            //throw new Error("Invalid ICS file");
        }
    }

    private SUMMARY_SELECTOR: string = "summary";
    private RULE_SELECTOR: string = "rrule";
    private LOCATION_SELECTOR: string = "location";
    private DESCRIPTION_SELECTOR: string = "description";
    private START_DATE_SELECTOR: string = "dtstart";
    private END_DATE_SELECTOR: string = "dtend";

    private createEvent(parsedEvent: any): mongoose.Document {
        if (parsedEvent) {
            let summary: string = parsedEvent.getFirstPropertyValue(this.SUMMARY_SELECTOR);
            let rules: any = parsedEvent.getFirstPropertyValue(this.RULE_SELECTOR);
            let day: string = rules.parts.BYDAY[0];
            // TODO use the db to transform to actual location.
            let fullICSLocation = parsedEvent.getFirstPropertyValue(this.LOCATION_SELECTOR);
            let location: string = this.getAddress(fullICSLocation.slice());
            let room: string = this.extractRoom(fullICSLocation.slice());
            let description: string = parsedEvent.getFirstPropertyValue(this.DESCRIPTION_SELECTOR);
            let startTime: Date = new Date(parsedEvent.getFirstPropertyValue(this.START_DATE_SELECTOR));
            let endTime: Date = new Date(parsedEvent.getFirstPropertyValue(this.END_DATE_SELECTOR));
            // TODO might be a bit redundant since we know the start date from the start time
            let startDay: Date = new Date(parsedEvent.getFirstPropertyValue(this.START_DATE_SELECTOR));
            let lastDay: Date = new Date(rules.until);
            let frequency: string = rules.freq;
            let recurrence: number = rules.interval;

            console.log(location + '   ' + fullICSLocation);
            return new EVENT.MODEL({
                summary: summary,
                day: day,
                location: location,
                room: room,
                description: description,
                startTime: startTime,
                endTime: endTime,
                startDay: startDay,
                lastDay: lastDay,
                frequency: frequency,
                recurrence: recurrence
            });
        } else {
            throw new Error("Null event");
        }
    }

    private ROOM_NOT_AVAILABLE: string = "N/A";
    private extractRoom(location: string) {
        if (location === null) {
            return this.ROOM_NOT_AVAILABLE;
        }
        let roomPtrn = new RegExp('Room.*');
        let roomMatches = location.match(roomPtrn);
        if (!roomMatches || roomMatches.length === 0) {
            return this.ROOM_NOT_AVAILABLE;
        }
        return roomMatches[0];
    }

    private LOCATION_SPECIFIER: string = ", Vancouver, BC, CA";
    private ADDRESSES_MAP: string = "locations";
    private getAddress(location: string): string {
        if (location === null) {
            return null;
        }
        let tokens = location.split(',');
        if (tokens.length <= 1) {
            return null;
        }
        let buildingName = tokens[0].trim();
        // TODO transform building name
        let actualAddress: string = locationsMap.getAddress(buildingName);
        if (actualAddress) {
            return actualAddress + this.LOCATION_SPECIFIER;
        }
        return buildingName + this.LOCATION_SPECIFIER;
    }
}

export default new IcsParser();
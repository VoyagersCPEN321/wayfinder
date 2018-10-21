"use strict";

/*
 * Unfortunately it has no available typedef file
 * so check the API here http://mozilla-comm.github.io/ical.js/api/.
 */
import * as ICAL from "ical.js";
import * as mongoose from "mongoose";
import EVENT from "../models/event";
import fs = require('fs');
import { start } from "repl";
import { last } from "mongoose/lib/utils";
import { create } from "domain";
import { parse } from "path";
/*
 * Parses a given string in ICS representation
 * to an array of events that can be later
 * manipulated and persisted.
 */
export class IcsParser {
    private VEVENT_SELECTOR: String = "vevent";
    public parseICS(icsContent: String): mongoose.Document[] {
        if (!icsContent) {
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

    private SUMMARY_SELECTOR: String = "summary";
    private RULE_SELECTOR: String = "rrule";
    private LOCATION_SELECTOR: String = "location";
    private DESCRIPTION_SELECTOR: String = "description";
    private START_DATE_SELECTOR: String = "dtstart";
    private END_DATE_SELECTOR: String = "dtend";

    private createEvent(parsedEvent: any): mongoose.Document {
        if (parsedEvent) {
            let summary: String = parsedEvent.getFirstPropertyValue(this.SUMMARY_SELECTOR);
            let rules: any = parsedEvent.getFirstPropertyValue(this.RULE_SELECTOR);
            let day: String = rules.parts.BYDAY[0];
            // TODO use the db to transform to actual location.
            let location: String = parsedEvent.getFirstPropertyValue(this.LOCATION_SELECTOR);
            let description: String = parsedEvent.getFirstPropertyValue(this.DESCRIPTION_SELECTOR);
            let startTime: Date = new Date(parsedEvent.getFirstPropertyValue(this.START_DATE_SELECTOR));
            let endTime: Date = new Date(parsedEvent.getFirstPropertyValue(this.END_DATE_SELECTOR));
            // TODO might be a bit redundant since we know the start date from the start time
            let startDay: Date = new Date(parsedEvent.getFirstPropertyValue(this.START_DATE_SELECTOR));
            let lastDay: Date = new Date(rules.until);
            let frequency: String = rules.freq;
            let recurrence: number = rules.interval;

            return new EVENT.MODEL({
                summary: summary,
                day: day,
                location: location,
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
}

export default new IcsParser();
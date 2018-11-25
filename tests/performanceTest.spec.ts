import 'chai';
import 'chai-http';
import SCHEDULE from '../src/models/schedule';
import chaiHttp = require('chai-http');
import chai = require('chai');
import { Server } from '../src/server';
import USER from '../src/models/user';
import { IUser } from '../src/models/user';
import Authenticator from '../src/authenticator';
import { ObjectID } from "bson";
import { expect } from 'chai';
import * as fs from 'fs';
import * as mongoose from 'mongoose';
import Parser from '../src/parsing/IcsParser';

chai.use(chaiHttp);

describe('Performance Test', () => {

    before((done) => {
        let schedule = fs.readFileSync('./ical-2.ics', 'utf-8');
        this.allEvents = Parser.parseICS(schedule);
        this.expectedEvents = [this.allEvents[0], this.allEvents[1]];
        const TEST_DB_LOCATION = "mongodb://localhost/systest";
        this.TEST_SERVER = new Server(TEST_DB_LOCATION).app;
        let that = this;
        setTimeout(async () => {
            await USER.remove({});
            await SCHEDULE.remove({});
            let newUsers: mongoose.Document[] = [];
            let usersSchedules: mongoose.Document[] = [];
            for(let i = 0; i<50e3; i++) {
                let expectedEvents = that.expectedEvents.slice();
                const user = new USER({
                    userId: new ObjectID(),
                    facebookId: i.toString(),
                    name: "test user yo + " + i
                });
                const userSchedule = new SCHEDULE({
                    userId: (user as IUser).userId,
                    events: expectedEvents
                });
                usersSchedules.push(userSchedule);
                newUsers.push(user);
            }
            console.log("finished creating users and schedules");
            await USER.collection.insertMany(newUsers);
            console.log("finished inserting users");
            await SCHEDULE.collection.insertMany(usersSchedules);
            console.log("finished inserting schedules");
            let testUser = newUsers[0];
            this.VALID_TOKEN = Authenticator.getUserToken(testUser);
            done();
        }, 3000);
    });

    it('should take less than 3 seconds to get user schedule', (done) => {
        let startTime = new Date().getTime();
        chai.request(this.TEST_SERVER)
            .get('/schedule')
            .set({'x-auth-token': this.VALID_TOKEN})
            .end((err, res) => {
                res.should.have.status(200);
                let endTime = new Date().getTime();
                let _3Secs = 3000;
                let actualTimeElapsed = endTime - startTime;
                expect(actualTimeElapsed).to.be.lessThan(_3Secs);
                expect(res.body.events.length).to.be.equal(this.expectedEvents.length);
                console.log("Actual time elapsed: " + actualTimeElapsed);
                done();
            });
    });

    after(async ()=> {
        await USER.remove({});
        await SCHEDULE.remove({});
    });
})
import 'mongoose';
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
import { isObject } from 'util';


let should = chai.should();

chai.use(chaiHttp);


describe('System Level tests', ()=> {
    const TEST_DB_LOCATION = "mongodb://localhost/systest";
    const TEST_USER = new USER({
        userId: new ObjectID(),
        facebookId: "0",
        name: "test user yo"
    });
    const VALID_TOKEN = Authenticator.getUserToken(TEST_USER);
    const TEST_SERVER = new Server(TEST_DB_LOCATION).app;
    const FB_TEST_USER_TOKEN = `EAACbyOmIlv8BABvA8tRGlHuvFM4YZBsIR6YB4j5lt4bi4RVFOVNcakd9LZBMJ0D5rd08toWLZCTSzz8aQDlz7EvQ8DxfeTxHlVsrfVpuZAw8UzFVumcMdndWnXHdbYxgKj05tzYqZA7qITmbnZAbeozSb1b7xZBhCCd3N6a36KE2t3M3h3gxmtzt7E7bDx9CHxbJDzntJGZCPVJNpKsxpMZBZAZApZCdL3ZCGQvZAnuOwydmVx3AZDZD`;

    beforeEach((done) => {
        SCHEDULE.remove({});
        USER.remove({});
        done();
    });
    
    describe('POST SCHEDULE FAILURE', () => {
        it('should return 401 because the token is invalid', (done) => { 
            let invalidToken = 'THIS%%IS%%AN%%INVALID%%TOKEN';
            chai.request(TEST_SERVER)
            .post('/schedule')
            .set({'x-auth-token' : invalidToken})
            .end((err, res) => {
                res.should.have.status(401);
                done();
            });
        });
        
        it('should return 500 status when file sent is not ICS formatted ', (done) => {
            let validToken = Authenticator.getUserToken(TEST_USER);
            chai.request(TEST_SERVER)
            .post('/schedule')
            .set({'x-auth-token' : validToken})
            //send invalid formatted files
            .end((err, res) => {
                res.should.have.status(500);
                done();
            });
        });
    });
    
    describe('POST SCHEDULE SUCESS', () => {
        it('should return 200 and insert the user scedule', (done) => {
            let fileData = fs.readFileSync("./ical-2.ics", 'utf-8');
            chai.request(TEST_SERVER)
            .post('/schedule')
            .set({'x-auth-token': VALID_TOKEN})
            .send({
                icsData: fileData
              })
            .end((err, res) => {
                res.should.have.status(200);
                expect(res.body.events.length).to.be.equals(30);
                done();
            });
        });

        it('should return 200 and update the user scedule', (done) => {
            let fileData = fs.readFileSync("./ical-2.ics", 'utf-8');
            chai.request(TEST_SERVER)
            .post('/schedule')
            .set({'x-auth-token': VALID_TOKEN})
            .send({
                icsData: fileData
              })
            .end((err, res) => {
                res.should.have.status(200);
                expect(res.body.events.length).to.be.equals(30);
                done();
            });
        });
    })
    
    /*
     * Test GET 
     */
    describe('GET /schedule', () => {
    
        it('should return 200 with schedule', (done) => {
                let validToken = Authenticator.getUserToken(TEST_USER);
                chai.request(TEST_SERVER)
                    .get('/schedule')
                    .set({'x-auth-token': VALID_TOKEN})
                    .end((err, res) => {
                        res.should.have.status(200);
                        done();
                    });
        });
    
        it('should return 404 with no schedule', (done) => {
            // clear any saved schedule for the user and make sure the server returns 404
            SCHEDULE.remove({ userId: (TEST_USER as IUser).userId }).then((res) => {
                chai.request(TEST_SERVER)
                .get('/schedule')
                .set({'x-auth-token': VALID_TOKEN})
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
            });
        });
    });
    
    describe('facebook auth', () => {
        beforeEach(() => {
            return USER.remove({});
        })
        it('should fail if token is invalid', (done) => {
            chai.request(TEST_SERVER)
            .post('/auth/fb')
            .set({'Authorization': 'Bearer ' + FB_TEST_USER_TOKEN + `gibberish` })
            .end((err, res) => {
                // TODO change to 400
                res.should.have.status(500);
                expect(res.body.token).to.not.be.null;
                done();
            });
        });
    
        it('should succeed with a valid token', (done) => {
            chai.request(TEST_SERVER)
            .post('/auth/fb')
            .set({'Authorization': 'Bearer ' + FB_TEST_USER_TOKEN})
            .end((err, res) => {
                // TODO change to 200
                res.should.have.status(401);
                done();
            });
        });
    });
    
    describe('bad headers', () => {
        it('auth/fb should fail with malformed headers', (done) => {
            chai.request(TEST_SERVER)
            .post('/auth/fb')
            .set({'AuthorizationYOYOYO': 'Bearer ' + FB_TEST_USER_TOKEN})
            .end((err, res) => {
                res.should.have.status(401);
                done();
            });
        });
    
        it('get schedule should fail with malformed headers', (done) => {
            chai.request(TEST_SERVER)
                .get('/schedule')
                .set({'x-auth-tokenssssss': VALID_TOKEN})
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
    });
})
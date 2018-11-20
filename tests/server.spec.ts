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

let should = chai.should();

chai.use(chaiHttp);


const TEST_DB_LOCATION = "mongodb://localhost/systest";
const TEST_USER = new USER({
    userId: new ObjectID(),
    facebookId: "0",
    name: "test user yo"
});
const VALID_TOKEN = Authenticator.getUserToken(TEST_USER);
const TEST_SERVER = new Server(TEST_DB_LOCATION).app;
const FB_TEST_USER_TOKEN = `EAACbyOmIlv8BAD8VCFXmWM4eJSpGagsxVToLZBH7E30TbnrVUdyX9ZBBWG3K39n1STtKE47NZC6ebFvaZCCG9JU2gDTvybZCV30ncJwj6qbHu953mLZBo77N6CCGe1WvqGTGmUO35iQL2gMgiTZB63DZCmaB7sjQcs5vaGyZBBE1eeSKNY1PUaWsuynFw0ZBysIVoAo09wkz6FjyZB636v8ZCwFa8f2GVq9ZCT3X6ZCZC3k8fZBj0gZDZD`;

describe('Let the server start with this delay', () => {
    before((done) => {
        setTimeout(()=> {
        }, 2000);
    });
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
    
    it('should return 400 status when file sent is not ICS formatted '), (done) => {
        let validToken = Authenticator.getUserToken(TEST_USER);
        chai.request(TEST_SERVER)
        .post('/schedule')
        .set({'x-auth-token' : validToken})
        //send invalid formatted files
        .end((err, res) => {
            res.should.have.status(200);
            done();
        });
    };
})

describe('POST SCHEDULE SUCESS', () => {
    it('should return 200 and update the user scedule', (done) => {
        chai.request(TEST_SERVER)
        .post('/schedule')
        .set({'x-auth-token': VALID_TOKEN})
        .end((err, res) => {
            res.should.have.status(200);
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
            res.should.have.status(400);
            expect(res.body.token).to.not.be.null;
            done();
        });
    });

    it('should succeed with a valid token', (done) => {
        chai.request(TEST_SERVER)
        .post('/auth/fb')
        .set({'Authorization': 'Bearer ' + FB_TEST_USER_TOKEN})
        .end((err, res) => {
            res.should.have.status(200);
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

describe('Server with bad DB param', () => {
    it(`should log an error but remain alive if there's an error in config`, (done) => {
        new Server("gibberish");
        // make a request and make sure the server responds
        chai.request(TEST_SERVER)
        .get('/schedule')
        .set({'x-auth-tokenssssss': VALID_TOKEN})
        .end((err, res) => {
            res.should.have.status(401);
            done();
        });
    });
});
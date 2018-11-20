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
import { SSL_OP_EPHEMERAL_RSA } from 'constants';
import { TIMEOUT } from 'dns';

let should = chai.should();

chai.use(chaiHttp);


const TEST_DB_LOCATION = "mongodb://localhost/systest";
const TEST_USER = new USER({
    userId: new ObjectID(),
    facebookId: "0",
    name: "test user yo"
});
const VALID_TOKEN = Authenticator.getUserToken(TEST_USER);
let test_server = new Server(TEST_DB_LOCATION).app;


describe('Let the server start with this delay', () => {
    before((done) => {
        setTimeout(()=> {
        }, 2000);
    });
});

describe('POST SCHEDULE SUCESS', () => {
    it('should return 200 and update the user scedule', (done) => {
        chai.request(test_server)
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
            chai.request(test_server)
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
            chai.request(test_server)
            .get('/schedule')
            .set({'x-auth-token': VALID_TOKEN})
            .end((err, res) => {
                res.should.have.status(404);
                done();
            });
        });
    });
});


import 'mongoose';
import 'chai';
import 'chai-http';
import SCHEDULE from '../src/models/schedule';
import chaiHttp = require('chai-http');
import chai = require('chai');
import { Server } from '../src/server';
import USER from '../src/models/user';
import Authenticator from '../src/authenticator';
import { ObjectID } from "bson";
import { SSL_OP_EPHEMERAL_RSA } from 'constants';
import { TIMEOUT } from 'dns';

let should = chai.should();

chai.use(chaiHttp);


describe('Clear Schedule', () => {
    beforeEach((done) => {
        SCHEDULE.remove({}, (err) => {
            done();
        });
    });
});

const TEST_DB_LOCATION = "mongodb://localhost/systest";
/*
 * Test GET 
 */
describe('GET /schedule', () => {
    // before(() => {

    // });

    it('should return 404 when no schedule', (done) => {
        this.server = new Server(TEST_DB_LOCATION).app;
        setTimeout(()=> {
            this.user = new USER({
                userId: new ObjectID(),
                facebookId: "0",
                name: "test user yo"
            });
            let validToken = Authenticator.getUserToken(this.user);
            chai.request(this.server)
                .get('/schedule')
                .set({'x-auth-token': validToken})
                .end((err, res) => {
                    console.log("got here");
                    res.should.have.status(404);
                    //res.body.should.be.;
                    done();
                });
        }, 2000);
    });
});


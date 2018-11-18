process.env.NODE_ENV = 'test';


import 'mongoose';
import 'chai';
import'chai-http';
import server from '../src/server';
import SCHEDULE from '../src/models/schedule';
import chaiHttp = require('chai-http');
import chai = require('chai');

let should  = chai.should();

chai.use(chaiHttp);


describe ('Clear Schedule',  () => {
    beforeEach((done) => {
        SCHEDULE.remove({}, (err) => {
            done();
        }); 
    });
});


/*
 * Test GET 
 */
describe('GET /schedule', () => {
    it('it should retrieve the user schedule', (done) => {
        chai.request(server)
            .get('/schedule')
            .end((err, res) =>{
                res.should.have.status(401);
                //res.body.should.be.;
                done();
            })
    })
});


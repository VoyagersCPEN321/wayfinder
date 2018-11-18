// import mongoose from 'mongoose';
// import chai from 'chai';
// import chaiHttp from 'chai-http';
// import server from '../src/server';
// import SCHEDULE from '../src/models/schedule';

// let should  = chai.should();

// chai.use(chaiHttp);


// describe ('Clear Schedule',  () => {
//     beforeEach((done) => {
//         SCHEDULE.remove({}, (err) => {
//             done();
//         }); 
//     });
// });


// /*
//  * Test GET 
//  */
// describe('GET /schedule', () => {
//     it('it should retrieve the user schedule', (done) => {
//         chai.request(server)
//             .get('/schedule')
//             .end((err, res) =>{
//                 res.should.have.status(200);
//                 //res.body.should.be.;
//                 done();
//             })
//     })
// });


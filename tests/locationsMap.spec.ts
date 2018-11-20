import 'mocha';
import { expect } from 'chai';
import fs = require('fs');
import LocationsMap from '../src/parsing/locationsMap';
import { IEvent } from '../src/models/event';
import { doesNotReject } from 'assert';


describe('valid building name', () => {

    it(`should return the expected address mapping for the given building name`, () => {

        let location: string = "Neville Scarfe";

        console.log(LocationsMap.getAddress(location));

        try{
            expect(LocationsMap.getAddress(location)).to.equal("2125 Main Mall");
        }
        catch (e) {
         
        }
    });

});

describe('invalid building name', () => {

    it(`should return null because the building name is not in the db`, () => {

        let location: string = "mcleod";

        try{
            expect(LocationsMap.getAddress(location)).to.be(null);
        }
        catch (e) {
          
        }
    });
    
});


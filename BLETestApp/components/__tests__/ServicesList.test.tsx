import React from 'react';
import {render} from 'react-native-testing-library';
import {Text} from 'react-native';
import ServicesList from '../ServicesList';
import BatteryService from '../BatteryService';

jest.mock('../BatteryService', () => jest.fn( () => null) );


describe("<ServicesList />", () => {
    beforeEach(() => {BatteryService.mockClear()});

    it("should render an empty list", () => {
        render(<ServicesList list={[]} />);
        expect(BatteryService).not.toHaveBeenCalled();
    })

    it("should present two services", () => {
        render(<ServicesList list={['service1', 'service2']} />);
        expect(BatteryService).toHaveBeenCalledWith({sname: 'service1'}, {});
        expect(BatteryService).toHaveBeenCalledWith({sname: 'service2'}, {});
        expect(BatteryService).toHaveBeenCalledTimes(2);
    })
})
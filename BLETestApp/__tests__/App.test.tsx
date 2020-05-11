import React from 'react';
import {render} from 'react-native-testing-library';
import App from '../App';
import BleManager from 'react-native-ble-manager';

jest.mock('react-native-ble-manager', () => ({start: jest.fn( () => Promise.resolve(true)) }) );


describe("<App />", () => {

        it("should render App", () => {
            render( <App /> );
        });

        it("should initialize BLE manager", async () => {
            render( <App />);
            await expect(BleManager.start).toHaveBeenCalled();
        });
})
import React from 'react';
import {act, render, waitForElement} from 'react-native-testing-library';
import ServicesList from '../ServicesList';
import BatteryService from '../BatteryService';
import {EmitterContext} from '../../App';

jest.mock('../BatteryService', () => jest.fn( () => null));
jest.mock("react-native", () => {
    const ReactNative = jest.requireActual('react-native');

    return Object.setPrototypeOf(
        {
          NativeModules: {
            ...ReactNative.NativeModules,
            BleManager: jest.fn()
          },
          NativeEventEmitter: jest.fn(() => ({addListener: jest.fn() }) ),
        },
        ReactNative
      );
});

const emitterMock = {addListener: jest.fn()}

describe("<ServicesList />", () => {

    let container;

    beforeEach(() => {
        BatteryService.mockClear();
        emitterMock.addListener.mockClear();
        container = render(
            <EmitterContext.Provider value={emitterMock}>
                <ServicesList />
            </EmitterContext.Provider>
        );
    });

    it("should render an empty list", () => {
        expect(BatteryService).not.toHaveBeenCalled();
    })

    it("should register BLE listener for peripheral discovery", async () => {
        await expect(emitterMock.addListener)
                .toHaveBeenCalledWith('BleManagerDiscoverPeripheral', expect.any(Function));
    });

    it("should add a new peripheral on discovery", async () => {
        const mockPeripheral = {
                                 id: '00-11-22',
                                 name: 'service1',
                                 rssi: 117,
                                 advertising: {
                                    isConnectable: true,
                                    serviceUUIDs: ['00-11', '11-22'],
                                    manufacturerData: {},
                                    serviceData: {},
                                    txPowerLevel: 23
                                 }
                             };
        act( () =>{ discoverNewService(emitterMock.addListener, mockPeripheral);} );
        await expect(BatteryService).toHaveBeenCalledWith({peripheral: mockPeripheral}, {});
        await expect(BatteryService).toHaveBeenCalledTimes(1);
    })
})

const discoverNewService = (mock, service) => {
        const lastCall = mock.mock.calls.length -1;
        const stopScanListener = mock.mock.calls[lastCall][1];
        stopScanListener(service.id, service.name, service.rssi, service.advertising);
};
import React from 'react';
import {act, cleanup, flushMicrotasksQueue, render, waitForElement} from 'react-native-testing-library';
import ServicesList from '../ServicesList';
import BatteryService, {SERVICE_UUID, CHARACTERISTIC_UUID} from '../BatteryService';
import {EmitterContext} from '../../App';
import BleManager from 'react-native-ble-manager';

jest.mock('react-native-ble-manager', () => ({ retrieveServices: jest.fn(() => Promise.resolve()),
                                               getDiscoveredPeripherals: jest.fn() }));

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
                         },
                         connected: false
                     };

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

    afterEach(cleanup);

    it("should render an empty list", () => {
        expect(BatteryService).not.toHaveBeenCalled();
    })

    it("should register BLE listener for peripheral discovery", async () => {
        await expect(emitterMock.addListener)
                .toHaveBeenCalledWith('BleManagerDiscoverPeripheral', expect.any(Function));
    });

    it("should register BLE listener for peripheral connected", async () => {
        await expect(emitterMock.addListener)
                .toHaveBeenCalledWith('BleManagerConnectPeripheral', expect.any(Function));
    });

    it("should register BLE listener for peripheral disconnected", async () => {
        await expect(emitterMock.addListener)
                .toHaveBeenCalledWith('BleManagerDisconnectPeripheral', expect.any(Function));
    });

    it("should register listener for scan ended", async () => {
        await expect(emitterMock.addListener)
                .toHaveBeenCalledWith('BleManagerStopScan', expect.any(Function));
    });

    it("should register BLE listener for characteristic change notification", async () => {
        await expect(emitterMock.addListener)
                .toHaveBeenCalledWith('BleManagerDidUpdateValueForCharacteristic', expect.any(Function));
    });

    it("should add a new peripheral on discovery", async () => {
        act( () =>{ callLastRegisteredPeripheralDiscoverListener(emitterMock.addListener, mockPeripheral);} );
        await flushMicrotasksQueue();
        await expect(BatteryService).toHaveBeenCalledWith({peripheral: mockPeripheral, connected: false, onRemoval: expect.any(Function)}, {});
        await expect(BatteryService).toHaveBeenCalledTimes(1);
    })

    it("should add a previously discovered peripheral on scan stop", async () => {
        BleManager.getDiscoveredPeripherals.mockImplementation((services_array) => Promise.resolve([mockPeripheral]));
        act( () =>{ callLastRegisteredScanStopListener(emitterMock.addListener, mockPeripheral);} );
        await flushMicrotasksQueue();
        await expect(BatteryService).toHaveBeenCalledWith({peripheral: mockPeripheral, connected: false, onRemoval: expect.any(Function)}, {});
        await expect(BatteryService).toHaveBeenCalledTimes(1);
    })

    it("should not add any previously discovered peripheral on scan stop", async () => {
        BleManager.getDiscoveredPeripherals.mockImplementation((services_array) => Promise.resolve([]));
        act( () =>{ callLastRegisteredScanStopListener(emitterMock.addListener, mockPeripheral);} );
        await flushMicrotasksQueue();
        await expect(BatteryService).not.toHaveBeenCalled();
    })

    it("should render new peripheral connection", async () => {
        const mockConnectedPeripheral = {...mockPeripheral, connected: true};
        BleManager.retrieveServices.mockImplementation(() => Promise.resolve(mockPeripheral));
        act( () =>{ callLastRegisteredPeripheralDiscoverListener(emitterMock.addListener, mockPeripheral);} );
        act( () =>{ callLastRegisteredPeripheralConnectionListener(emitterMock.addListener, mockConnectedPeripheral.id);} );
        await flushMicrotasksQueue();
        await expect(BatteryService).toHaveBeenLastCalledWith({peripheral: mockConnectedPeripheral, connected: true, onRemoval: expect.any(Function)}, {});
        await expect(BatteryService).toHaveBeenCalledTimes(3);
    })

    it("should should issue `retrieveServices` on peripheral connection", async () => {
        act( () =>{ callLastRegisteredPeripheralDiscoverListener(emitterMock.addListener, mockPeripheral);} );
        const mockConnectedPeripheral = {...mockPeripheral, connected: true};
        act( () =>{ callLastRegisteredPeripheralConnectionListener(emitterMock.addListener, mockConnectedPeripheral.id);} );
        await expect(BleManager.retrieveServices).toHaveBeenLastCalledWith(mockConnectedPeripheral.id);
    })

    it("should render new peripheral disconnection", async () => {
        const mockConnectedPeripheral = {...mockPeripheral, connected: true};
        BleManager.retrieveServices.mockImplementation(() => Promise.resolve(mockPeripheral));
        act( () =>{ callLastRegisteredPeripheralDiscoverListener(emitterMock.addListener, mockPeripheral);} );
        await flushMicrotasksQueue();
        act( () =>{ callLastRegisteredPeripheralConnectionListener(emitterMock.addListener, mockConnectedPeripheral.id);} );
        await flushMicrotasksQueue();
        act( () =>{ callLastRegisteredPeripheralDisconnectionListener(emitterMock.addListener, mockPeripheral.id);} );
        await flushMicrotasksQueue();
        await expect(BatteryService).toHaveBeenLastCalledWith({peripheral: mockPeripheral, connected: false, onRemoval: expect.any(Function)}, {});
        await expect(BatteryService).toHaveBeenCalledTimes(4);
    })

    it("should render new value characteristic for peripheral", async () => {
        const value = 37;
        const uint8 = new Uint8Array(1);
        uint8[0] = value;
        const mockConnectedPeripheral = {...mockPeripheral, connected: true, level: value};
        BleManager.retrieveServices.mockImplementation(() => Promise.resolve(mockPeripheral));
        act( () =>{ callLastRegisteredPeripheralDiscoverListener(emitterMock.addListener, mockPeripheral);} );
        await flushMicrotasksQueue();
        act( () =>{ callLastRegisteredCharacteristicValueChangeListener(emitterMock.addListener, uint8, mockPeripheral, CHARACTERISTIC_UUID,SERVICE_UUID);} );
        await flushMicrotasksQueue();
        await expect(BatteryService).toHaveBeenLastCalledWith({peripheral: mockConnectedPeripheral, connected: true, onRemoval: expect.any(Function), level: value}, {});
        await expect(BatteryService).toHaveBeenCalledTimes(2);
    })

    it("should ignore new value characteristic for peripheral", async () => {
        const value = 37;
        const uint8 = new Uint8Array(1);
        uint8[0] = value;
        const mockConnectedPeripheral = {...mockPeripheral, connected: true, level: value};
        BleManager.retrieveServices.mockImplementation(() => Promise.resolve(mockPeripheral));
        act( () =>{ callLastRegisteredPeripheralDiscoverListener(emitterMock.addListener, mockPeripheral);} );
        await flushMicrotasksQueue();
        act( () =>{ callLastRegisteredCharacteristicValueChangeListener(emitterMock.addListener, uint8, mockPeripheral, "AA00",SERVICE_UUID);} );
        await flushMicrotasksQueue();
        await expect(BatteryService).not.toHaveBeenLastCalledWith({peripheral: mockConnectedPeripheral, connected: true, onRemoval: expect.any(Function), level: value}, {});
        await expect(BatteryService).toHaveBeenCalledTimes(1);
    })

})

const callLastRegisteredPeripheralDiscoverListener = (mock, peripheral) => {
        const lastCall = findLastListenerCallFor('BleManagerDiscoverPeripheral', mock);
        const discoverPeripheralListener = mock.mock.calls[lastCall][1];
        discoverPeripheralListener(peripheral);
};

const callLastRegisteredPeripheralConnectionListener = (mock, peripheralId) => {
        const lastCall = findLastListenerCallFor('BleManagerConnectPeripheral', mock);
        const connectPeripheralListener = mock.mock.calls[lastCall][1];
        connectPeripheralListener({peripheral: peripheralId, status:0});
};

const callLastRegisteredPeripheralDisconnectionListener = (mock, peripheralId) => {
        const lastCall = findLastListenerCallFor('BleManagerDisconnectPeripheral', mock);
        const disconnectPeripheralListener = mock.mock.calls[lastCall][1];
        disconnectPeripheralListener({peripheral: peripheralId, status: 0});
};

const callLastRegisteredScanStopListener = mock => {
        const lastCall = findLastListenerCallFor('BleManagerStopScan', mock);
        const scanStop = mock.mock.calls[lastCall][1];
        scanStop();
};

const callLastRegisteredCharacteristicValueChangeListener = (mock, value, peripheral, characteristic, service) => {
        const lastCall = findLastListenerCallFor('BleManagerDidUpdateValueForCharacteristic', mock);
        const characteristicChangeListener = mock.mock.calls[lastCall][1];
        characteristicChangeListener({value, peripheral, characteristic, service});
};


const findLastListenerCallFor =  (listenerName, mock) => {
      const callsFound = mock.mock.calls.map( (call, index) => call[0] == listenerName ? index : undefined);
      const callsFiltered = callsFound.filter(x => x !== undefined);
      const lastCall = callsFiltered.slice(-1)[0];
      return lastCall;
};
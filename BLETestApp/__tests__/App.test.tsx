import React from 'react';
import {render} from 'react-native-testing-library';
import App, {bleManagerEmitter} from '../App';
import * as BleManager from 'react-native-ble-manager';
import * as ReactNative from 'react-native';

jest.mock('react-native-ble-manager', () => ({start: jest.fn( () => Promise.resolve(true)) }) );
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

const mockEmitter = {addListener: jest.fn()};

describe("<App />", () => {

        it("should render App", () => {
            render( <App /> );
        });

        it("should initialize BLE manager", async () => {
            render( <App />);
            await expect(BleManager.start).toHaveBeenCalled();
        });

        it("should create 'NativeEventEmitter'", async () => {
            render( <App />);
            await expect(ReactNative.NativeEventEmitter).toHaveBeenCalled();
        });

        it("should register BLE listener for peripheral discovery", async () => {
            render( <App emitter={mockEmitter} />);
            await expect(mockEmitter.addListener)
                    .toHaveBeenCalledWith('BleManagerDiscoverPeripheral', expect.any(Function));
        });

        it("should register BLE listener for end of scan", async () => {
            render( <App emitter={mockEmitter} />);
            await expect(mockEmitter.addListener)
                    .toHaveBeenCalledWith('BleManagerStopScan', expect.any(Function));
        });

        it("should register BLE listener for peripheral connected", async () => {
            render( <App emitter={mockEmitter} />);
            await expect(mockEmitter.addListener)
                    .toHaveBeenCalledWith('BleManagerConnectPeripheral', expect.any(Function));
        });

        it("should register BLE listener for peripheral disconnected", async () => {
            render( <App emitter={mockEmitter} />);
            await expect(mockEmitter.addListener)
                    .toHaveBeenCalledWith('BleManagerDisconnectPeripheral', expect.any(Function));
        });

})
import React from 'react';
import {render, flushMicrotasksQueue} from 'react-native-testing-library';
import App, {bleManagerEmitter} from '../App';
import * as BleManager from 'react-native-ble-manager';
import * as ReactNative from 'react-native';
import * as Permissions from 'expo-permissions';

jest.mock('react-native-ble-manager', () => ({start: jest.fn( () => Promise.resolve(true)),
                                              enableBluetooth: jest.fn( () => Promise.resolve(true))}) );
jest.mock("react-native", () => {
    const ReactNative = jest.requireActual('react-native');

    return Object.setPrototypeOf(
        {
          NativeModules: {
            ...ReactNative.NativeModules,
            BleManager: jest.fn(),
          },
          NativeEventEmitter: jest.fn(() => ({addListener: jest.fn() }) ),
          BackHandler: { exitApp: jest.fn() },
        },
        ReactNative
      );
});

jest.mock('expo-permissions', () => ({askAsync: jest.fn( () => Promise.resolve({status: 'denied'})),
                                      }) );


const mockEmitter = {addListener: jest.fn()};

describe("<App />", () => {

        beforeEach(() => {
            ReactNative.BackHandler.exitApp.mockClear();
        });

        it("should render App", () => {
            render( <App /> );
        });

        it("should initialize BLE manager", async () => {
            render( <App />);
            await expect(BleManager.start).toHaveBeenCalled();
        });

        it("should check if BLE is enabled", async () =>{
            render( <App />);
            await expect(BleManager.enableBluetooth).toHaveBeenCalled();
        });

        it("should terminate app if BLE not enabled and user refuses enabling it", async () => {
            BleManager.enableBluetooth.mockImplementation(() => Promise.reject(new Error("Refused!")));
            render( <App />);
            await flushMicrotasksQueue();
            expect(ReactNative.BackHandler.exitApp).toHaveBeenCalled();
        });

        it("should check if LOCATION permission is granted", async () => {
            render( <App />);
            await expect(Permissions.askAsync).toHaveBeenCalled();
        });

        it("should terminate app if LOCATION not enabled and user refuses enabling it", async () => {
            render( <App />);
            await flushMicrotasksQueue();
            await expect(ReactNative.BackHandler.exitApp).toHaveBeenCalled();
        });

        it("should create 'NativeEventEmitter'", async () => {
            render( <App />);
            await expect(ReactNative.NativeEventEmitter).toHaveBeenCalled();
        });
})
import React from 'react';
import {act, fireEvent, render, waitForElement} from 'react-native-testing-library';
import ScanningButton, {SCAN_PERIOD_IN_SECONDS} from '../ScanningButton';
import BleManager from 'react-native-ble-manager';
import {EmitterContext} from '../../App';
import {SERVICE_UUID} from '../BatteryService';
import * as ReactNative from 'react-native';

jest.mock('react-native-ble-manager', () => ({ scan: jest.fn( () => Promise.resolve(['uuid'])),
                                              stopScan: jest.fn( () => Promise.resolve()) }) );
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

const emitterMock = { addListener: jest.fn() };

describe("<ScanningButton />", () => {

    let container;

    beforeEach(() => {
        emitterMock.addListener.mockClear();
        container = render(
            <EmitterContext.Provider value={emitterMock}>
                <ScanningButton />
            </EmitterContext.Provider>
         );
    });

    it("should show 'START SCAN'", async () => {
        expect(container.getByText("START SCAN")).toBeTruthy();
    });

    it("should register listener for scan ended", async () => {
        await expect(emitterMock.addListener)
                .toHaveBeenCalledWith('BleManagerStopScan', expect.any(Function));
    });

    it("should change text to 'STOP SCAN' and back", async () => {
        fireEvent.press(container.getByText("START SCAN"));
        await waitForElement(() => container.getByText('STOP SCAN'));
        fireEvent.press(container.getByText("STOP SCAN"));
        await waitForElement(() => container.getByText('START SCAN'));
    });
    it("should call 'scan' on button press and then, 'stopScan'", async () => {
        fireEvent.press(container.getByText("START SCAN"));
        await expect(BleManager.scan).toHaveBeenCalledWith([SERVICE_UUID], SCAN_PERIOD_IN_SECONDS, true);
        await waitForElement(() => container.getByText('STOP SCAN'));
        fireEvent.press(container.getByText("STOP SCAN"));
        await expect(BleManager.stopScan).toHaveBeenCalledWith();
    });

    it("should display 'START SCAN' after scan period finished", async () => {
        fireEvent.press(container.getByText("START SCAN"));
        await waitForElement(() => container.getByText('STOP SCAN'));
        act(() => {callLastRegisteredScanEndListener(emitterMock.addListener)});
        await waitForElement(() => container.getByText('START SCAN'));
    })
})

const callLastRegisteredScanEndListener = mock => {
        const lastCall = mock.mock.calls.length -1;
        const stopScanListener = mock.mock.calls[lastCall][1];
        stopScanListener();
};
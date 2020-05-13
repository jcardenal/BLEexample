import React from 'react';
import {fireEvent, render, waitForElement} from 'react-native-testing-library';
import ScanningButton, {SCAN_PERIOD_IN_SECONDS} from '../ScanningButton';
import BleManager from 'react-native-ble-manager';

jest.mock('react-native-ble-manager', () => ({ scan: jest.fn( () => Promise.resolve(['uuid'])),
                                              stopScan: jest.fn( () => Promise.resolve()) }) );

describe("<ScanningButton />", () => {

    let container;

    beforeEach(() => {
        container = render( <ScanningButton />);
    });

    it("should show 'START SCAN'", async () => {
        expect(container.getByText("START SCAN")).toBeTruthy();
    });
    it("should change text to 'STOP SCAN' and back", async () => {
        fireEvent.press(container.getByText("START SCAN"));
        await waitForElement(() => container.getByText('STOP SCAN'));
        fireEvent.press(container.getByText("STOP SCAN"));
        await waitForElement(() => container.getByText('START SCAN'));
    });
    it("should call 'scan' on button press and then, 'stopScan'", async () => {
        fireEvent.press(container.getByText("START SCAN"));
        await expect(BleManager.scan).toHaveBeenCalledWith([], SCAN_PERIOD_IN_SECONDS, true);
        await waitForElement(() => container.getByText('STOP SCAN'));
        fireEvent.press(container.getByText("STOP SCAN"));
        await expect(BleManager.stopScan).toHaveBeenCalledWith();
    });
})

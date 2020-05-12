import React from 'react';
import {fireEvent, render, waitForElement} from 'react-native-testing-library';
import ScanningButton, {SCAN_PERIOD_IN_SECONDS} from '../ScanningButton';
import BleManager from 'react-native-ble-manager';

jest.mock('react-native-ble-manager', () => ({ scan: jest.fn( () => Promise.resolve(['uuid'])),
                                              stopScan: jest.fn( () => Promise.resolve()) }) );

describe("<ScanningButton />", () => {
    it("should show 'START SCAN'", async () => {
        const {getByText} = render( <ScanningButton />);
        expect(getByText("START SCAN")).toBeTruthy();
    });
    it("should change text to 'STOP SCAN' and back", async () => {
        const {getByText} = render( <ScanningButton />);
        fireEvent.press(getByText("START SCAN"));
        await waitForElement(() => getByText('STOP SCAN'));
        fireEvent.press(getByText("STOP SCAN"));
        await waitForElement(() => getByText('START SCAN'));
    });
    it("should call 'scan' on button press and then, 'stopScan'", async () => {
        const {getByText} = render( <ScanningButton />);
        fireEvent.press(getByText("START SCAN"));
        await expect(BleManager.scan).toHaveBeenCalledWith([], SCAN_PERIOD_IN_SECONDS, true);
        await waitForElement(() => getByText('STOP SCAN'));
        fireEvent.press(getByText("STOP SCAN"));
        await expect(BleManager.stopScan).toHaveBeenCalled();
    });
})

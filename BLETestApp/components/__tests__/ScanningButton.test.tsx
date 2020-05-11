import React from 'react';
import {fireEvent, render, waitForElement} from 'react-native-testing-library';
import ScanningButton from '../ScanningButton'

const startScan = jest.fn()
const stopScan = jest.fn()

describe("<ScanningButton />", () => {
    it("should show 'START SCAN'", async () => {
        const {getByText} = render( <ScanningButton startScan={startScan} stopScan={stopScan}/>);
        expect(getByText("START SCAN")).toBeTruthy();
    });
    it("should change text to 'STOP SCAN' and back", async () => {
        const {getByText} = render( <ScanningButton startScan={startScan} stopScan={stopScan}/>);
        fireEvent.press(getByText("START SCAN"));
        await waitForElement(() => getByText('STOP SCAN'));
        fireEvent.press(getByText("STOP SCAN"));
        await waitForElement(() => getByText('START SCAN'));
    });
    it("should call 'startScan' on button press and then, 'stopScan'", async () => {
        const {getByText} = render( <ScanningButton startScan={startScan} stopScan={stopScan}/>);
        fireEvent.press(getByText("START SCAN"));
        expect(startScan).toHaveBeenCalled();
        await waitForElement(() => getByText('STOP SCAN'));
        fireEvent.press(getByText("STOP SCAN"));
        expect(stopScan).toHaveBeenCalled();
    });
})

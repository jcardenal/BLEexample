import React from 'react';
import '@testing-library/jest-native/extend-expect';
import {fireEvent, render, waitForElement} from 'react-native-testing-library';
import BatteryService from '../BatteryService';

describe("<BatteryService />", () => {

    describe("structural tests", () => {
        it("should render component", () => {
            render(<BatteryService />)
        })

        it("should render CONNECT button", () => {
            const {getByText} = render(<BatteryService />)
            expect(getByText("CONNECT")).toBeTruthy()
        })

        it("should render 'n/a' service name", () => {
            const {getByText} = render(<BatteryService />)
            expect(getByText("N/A")).toBeTruthy()
        })

        it("should render 'Battery: unknown' message", () => {
            const {getByText} = render(<BatteryService />)
            expect(getByText("Battery: unknown")).toBeTruthy()
        })

        it("should render 'READ' button disabled", () => {
            const {getByText} = render(<BatteryService />)
            expect(getByText("READ")).toBeTruthy()
            expect(getByText("READ")).toBeDisabled(true)
        })
    })

    describe("On Click", () => {
        it("should change 'CONNECT' to 'DISCONNECT' and back", async () => {
            const {getByText} = render(<BatteryService />)
            fireEvent.press(getByText("CONNECT"))
            await waitForElement(() => getByText('DISCONNECT'));
            fireEvent.press(getByText("DISCONNECT"));
            await waitForElement(() => getByText('CONNECT'));
        })

        it ("should enable 'READ' after 'CONNECT'", () => {
            const {getByText} = render(<BatteryService />)
            fireEvent.press(getByText("CONNECT"))
            expect(getByText("READ")).not.toBeDisabled()
        })

        it ("should disable 'READ' after 'DISCONNECT'", async () => {
            const {getByText} = render(<BatteryService />)
            fireEvent.press(getByText("CONNECT"))
            await waitForElement(() => getByText('DISCONNECT'));
            fireEvent.press(getByText("DISCONNECT"));
            expect(getByText("READ")).toBeDisabled()
        })

        it ("should render 'micropython-esp32' as service name", () => {
            const {getByText} = render(<BatteryService sname="micropython-esp32"/>)
            expect(getByText("micropython-esp32")).toBeTruthy()
        })

        it("should render 'Battery: 93%' message", async () => {
            const mockBatteryReader = jest.fn(() => 93)
            const {getByText} = render(<BatteryService onRead={mockBatteryReader}/>)
            fireEvent.press(getByText("CONNECT"))
            fireEvent.press(getByText("READ"))
            await waitForElement(() => getByText("Battery: 93%"))
        })
    })
})
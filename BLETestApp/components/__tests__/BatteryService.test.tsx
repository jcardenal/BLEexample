import React from 'react';
import '@testing-library/jest-native/extend-expect';
import {fireEvent, render, waitForElement} from 'react-native-testing-library';
import BatteryService from '../BatteryService';

describe("<BatteryService />", () => {

    describe("structural tests", () => {
        let container;
        beforeEach(() => {
          container = render(<BatteryService />)
        });

        it("should render component", () => {
            expect(container).toBeTruthy();
        })

        it("should render CONNECT button", () => {
            expect(container.getByText("CONNECT")).toBeTruthy()
        })

        it("should render 'n/a' service name", () => {
            expect(container.getByText("N/A")).toBeTruthy()
        })

        it("should render 'Battery: unknown' message", () => {
            expect(container.getByText("Battery: unknown")).toBeTruthy()
        })

        it("should render 'READ' button disabled", () => {
            expect(container.getByText("READ")).toBeTruthy()
            expect(container.getByText("READ")).toBeDisabled(true)
        })
    })

    describe("On Click", () => {

        let container;
        beforeEach(() => {
          const mockBatteryReader = jest.fn(() => 93)
          container = render(<BatteryService sname="micropython-esp32" onRead={mockBatteryReader} />)
        });

        it("should change 'CONNECT' to 'DISCONNECT' and back", async () => {
            fireEvent.press(container.getByText("CONNECT"))
            await waitForElement(() => container.getByText('DISCONNECT'));
            fireEvent.press(container.getByText("DISCONNECT"));
            await waitForElement(() => container.getByText('CONNECT'));
        })

        it ("should enable 'READ' after 'CONNECT'", () => {
            fireEvent.press(container.getByText("CONNECT"))
            expect(container.getByText("READ")).not.toBeDisabled()
        })

        it ("should disable 'READ' after 'DISCONNECT'", async () => {
            fireEvent.press(container.getByText("CONNECT"))
            await waitForElement(() => container.getByText('DISCONNECT'));
            fireEvent.press(container.getByText("DISCONNECT"));
            expect(container.getByText("READ")).toBeDisabled()
        })

        it ("should render 'micropython-esp32' as service name", () => {
            expect(container.getByText("micropython-esp32")).toBeTruthy()
        })

        it("should render 'Battery: 93%' message", async () => {
            fireEvent.press(container.getByText("CONNECT"))
            fireEvent.press(container.getByText("READ"))
            await waitForElement(() => container.getByText("Battery: 93%"))
        })
    })
})
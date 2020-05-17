import React from 'react';
import '@testing-library/jest-native/extend-expect';
import {act, fireEvent, render, waitForElement} from 'react-native-testing-library';
import BatteryService from '../BatteryService';
import * as BleManager from 'react-native-ble-manager';

jest.mock('react-native-ble-manager', () => ({ connect: jest.fn(() => Promise.resolve()),
                                               disconnect: jest.fn(() => Promise.resolve()),
                                               read: jest.fn(() => {
                                                   const uint8 = new Uint8Array(1);
                                                   uint8[0] = 93;
                                                   return Promise.resolve(uint8);
                                               }),
                                               removePeripheral: jest.fn(() => Promise.resolve()),
                                             }));

const mockPeripheral = {
                         id: '00-11-22',
                         name: 'micropython-esp32',
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



describe("<BatteryService />", () => {

    beforeEach(() => {
        BleManager.connect.mockClear();
        BleManager.disconnect.mockClear();
        BleManager.read.mockClear();
        BleManager.removePeripheral.mockClear();
        jest.useFakeTimers();
    });

    describe("when peripheral is not connected", () => {
        let container;
        const noNamedMockPeripheral = {...mockPeripheral, name: undefined};
        beforeEach(() => {
          container = render(
                <BatteryService peripheral={noNamedMockPeripheral} connected={false}/>
              );
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

        it("should request connection when 'CONNECT' pressed", async () => {
            fireEvent.press(container.getByText("CONNECT"));
            await expect(BleManager.connect).toHaveBeenCalledWith(mockPeripheral.id);
        })
    })

    describe("When peripheral is connected", () => {

        let container;
        beforeEach(() => {
          const mockConnectedPeripheral = {...mockPeripheral, connected: true};
          container = render(
                            <BatteryService peripheral={mockConnectedPeripheral} connected={true} />
                        );
        });


        it("should enable 'READ'", () => {
            expect(container.getByText("READ")).toBeTruthy()
            expect(container.getByText("READ")).not.toBeDisabled()
        })

        it("should render 'micropython-esp32' as service name", () => {
            expect(container.getByText("micropython-esp32")).toBeTruthy()
        })

        it("should call BLE read when 'READ' button pressed", async () => {
            fireEvent.press(container.getByText("READ"));
            await expect(BleManager.read).toHaveBeenLastCalledWith(mockPeripheral.id, "180F", "2A19" );
        })

        it("should render 'Battery: 93%' message",async () => {
            jest.useRealTimers();
            fireEvent.press(container.getByText("READ"));
            await waitForElement(() => container.getByText("Battery: 93%"));
        })

        it("should request disconnection when 'DISCONNECT' pressed", async () => {
            fireEvent.press(container.getByText("DISCONNECT"));
            await expect(BleManager.disconnect).toHaveBeenCalledWith(mockPeripheral.id);
        })
    })

    describe("when removing peripheral", () => {
        let container;
        const noNamedMockPeripheral = {...mockPeripheral, name: undefined};
        const removalCallbackMock = jest.fn();
        beforeEach(() => {
          container = render(
                <BatteryService peripheral={noNamedMockPeripheral} connected={false} onRemoval={removalCallbackMock} />
              );
        });

        it("should disconnect and remove peripheral", async () => {
            fireEvent.press(container.getByText("REMOVE"));
            await expect(BleManager.disconnect).toHaveBeenCalledWith(mockPeripheral.id);
            await expect(BleManager.removePeripheral).toHaveBeenCalledWith(mockPeripheral.id);
        })

        it("should call removal callback", async () => {
            fireEvent.press(container.getByText("REMOVE"));
            await expect(removalCallbackMock).toHaveBeenCalledWith(mockPeripheral.id);
        })

    })
})

import React from 'react';
import '@testing-library/jest-native/extend-expect';
import {act, cleanup, fireEvent, flushMicrotasksQueue, render, waitForElement} from 'react-native-testing-library';
import BatteryService, {SERVICE_UUID, CHARACTERISTIC_UUID} from '../BatteryService';
import * as BleManager from 'react-native-ble-manager';

jest.mock('react-native-ble-manager', () => ({ connect: jest.fn(() => Promise.resolve()),
                                               disconnect: jest.fn(() => Promise.resolve()),
                                               read: jest.fn(() => {
                                                   const uint8 = new Uint8Array(1);
                                                   uint8[0] = 93;
                                                   return Promise.resolve(uint8);
                                               }),
                                               removePeripheral: jest.fn(() => Promise.resolve()),
                                               startNotification: jest.fn(() => Promise.resolve()),
                                               stopNotification: jest.fn(() => Promise.resolve()),
                                               retrieveServices: jest.fn(() => Promise.resolve()),
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
        BleManager.startNotification.mockClear();
        BleManager.stopNotification.mockClear();
        BleManager.retrieveServices.mockClear();
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

        afterEach(cleanup);

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

        describe("When peripheral supports notifications in characteristic", () => {

            let mockPeripheralSupportingNotifications;

            beforeEach(() => {
              const notifiable = {  characteristic: '2a19',
                                   properties: { Notify: 'Notify', Read: 'Read' },
                                   service: '180f' };
              mockPeripheralSupportingNotifications = {...mockPeripheral, characteristics: [notifiable]};
              container = render(
                      <BatteryService peripheral={mockPeripheralSupportingNotifications} connected={false}/>
                    );
            });

            afterEach(cleanup);

            it("should render toggle notifications disabled", () => {
                expect(container.getByText("Notify me!")).toBeTruthy()
                expect(container.getByTestId("toggleSwitch")).toBeDisabled()
            })
        })

        describe("When peripheral doesn't support notifications in characteristic", () => {
            let mockPeripheralSupportingNotifications;

            beforeEach(() => {
              const nonNotifiable = {  characteristic: '2a19',
                                   properties: { Read: 'Read' },
                                   service: '180f' };
              mockPeripheralNotSupportingNotifications = {...mockPeripheral, characteristics: [nonNotifiable]};
              container = render(
                      <BatteryService peripheral={mockPeripheralNotSupportingNotifications} connected={false}/>
                    );
            });

            afterEach(cleanup);

            it("should not render toggle notifications", () => {
                expect(container.queryByText("Notify me!")).toBeNull()
                expect(container.queryByTestId("toggleSwitch")).toBeNull()
            })

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

        afterEach(cleanup);

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

        describe("When peripheral supports notifications in characteristic", () => {

            let mockPeripheralSupportingNotifications;

            beforeEach(() => {
              const notifiable = {  characteristic: '2a19',
                                   properties: { Notify: 'Notify', Read: 'Read' },
                                   service: '180f' };
              mockPeripheralSupportingNotifications = {...mockPeripheral, characteristics: [notifiable]};
              container = render(
                      <BatteryService peripheral={mockPeripheralSupportingNotifications} connected={true}/>
                    );
            });

            afterEach(cleanup);

            it("should render toggle notifications enabled", () => {
                expect(container.getByText("Notify me!")).toBeTruthy()
                expect(container.getByTestId("toggleSwitch")).not.toBeDisabled()
            })

            it("should start notifications when toggled to 'ON'", async () => {
                fireEvent(container.getByTestId("toggleSwitch"), 'valueChange', true);
                await flushMicrotasksQueue();
                await expect(BleManager.retrieveServices).toHaveBeenCalledWith(mockPeripheral.id, [SERVICE_UUID]);
                await expect(BleManager.startNotification).toHaveBeenCalledWith(mockPeripheral.id, SERVICE_UUID, CHARACTERISTIC_UUID);
            })

            it("should stop notifications when toggled to 'OFF'", async () => {
                fireEvent(container.getByTestId("toggleSwitch"), 'valueChange', false);
                await flushMicrotasksQueue();
                await expect(BleManager.stopNotification).toHaveBeenCalledWith(mockPeripheral.id, SERVICE_UUID, CHARACTERISTIC_UUID);
            })

        })

        describe("When peripheral doesn't support notifications in characteristic", () => {
            let mockPeripheralSupportingNotifications;

            beforeEach(() => {
              const nonNotifiable = {  characteristic: '2a19',
                                   properties: { Read: 'Read' },
                                   service: '180f' };
              mockPeripheralNotSupportingNotifications = {...mockPeripheral, characteristics: [nonNotifiable]};
              container = render(
                      <BatteryService peripheral={mockPeripheralNotSupportingNotifications} connected={true}/>
                    );
            });

            afterEach(cleanup);

            it("should not render toggle notifications", () => {
                expect(container.queryByText("Notify me!")).toBeNull()
                expect(container.queryByTestId("toggleSwitch")).toBeNull()
            })

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

        afterEach(cleanup);

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

    describe("when battery level is provided", () => {
        let container;
        const removalCallbackMock = jest.fn();
        const batteryLevel = 87;

        beforeEach(() => {
          container = render(
                <BatteryService peripheral={mockPeripheral}
                            connected={true}
                            onRemoval={removalCallbackMock}
                            level={batteryLevel}/>
              );
        });

        afterEach(cleanup);

        it("should display battery level",  () => {
            expect(container.getByText(`Battery: ${batteryLevel}%`)).toBeTruthy();
        })

    })

})

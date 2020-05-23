import React from 'react';
import '@testing-library/jest-native/extend-expect';
import {act, cleanup, fireEvent, flushMicrotasksQueue, render, waitForElement} from 'react-native-testing-library';
import BatteryService, {SERVICE_UUID, CHARACTERISTIC_UUID} from '../BatteryService';
import * as BleManager from 'react-native-ble-manager';
import {EmitterContext} from '../../App';


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

const emitterMock = {addListener: jest.fn()}

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
                    <EmitterContext.Provider value={emitterMock}>
                       <BatteryService peripheral={noNamedMockPeripheral} connected={false}/>
                    </EmitterContext.Provider>
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

        it("should register BLE listener for characteristic change notification", async () => {
            await expect(emitterMock.addListener)
                    .toHaveBeenCalledWith('BleManagerDidUpdateValueForCharacteristic', expect.any(Function));
        });


        describe("When peripheral supports notifications in characteristic", () => {

            let mockPeripheralSupportingNotifications;

            beforeEach(() => {
              const notifiable = {  characteristic: '2a19',
                                   properties: { Notify: 'Notify', Read: 'Read' },
                                   service: '180f' };
              mockPeripheralSupportingNotifications = {...mockPeripheral, characteristics: [notifiable]};
              container = render(
                      <EmitterContext.Provider value={emitterMock}>
                        <BatteryService peripheral={mockPeripheralSupportingNotifications} connected={false}/>
                      </EmitterContext.Provider>
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
                      <EmitterContext.Provider value={emitterMock}>
                        <BatteryService peripheral={mockPeripheralNotSupportingNotifications} connected={false}/>
                      </EmitterContext.Provider>
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
                            <EmitterContext.Provider value={emitterMock}>
                                <BatteryService peripheral={mockConnectedPeripheral} connected={true} />
                            </EmitterContext.Provider>
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
                      <EmitterContext.Provider value={emitterMock}>
                            <BatteryService peripheral={mockPeripheralSupportingNotifications} connected={true}/>
                      </EmitterContext.Provider>
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

            it("should render new value characteristic for peripheral", async () => {
                jest.useRealTimers();
                const value = 37;
                const uint8 = new Uint8Array(1);
                uint8[0] = value;
                act( () =>{ callLastRegisteredCharacteristicValueChangeListener(emitterMock.addListener, uint8, mockPeripheral.id, CHARACTERISTIC_UUID,SERVICE_UUID);} );
                await flushMicrotasksQueue();
                await waitForElement(() => container.getByText(`Battery: ${value}%`));
            })

            it("should ignore new value characteristic for peripheral", async () => {
                jest.useRealTimers();
                const value = 37;
                const uint8 = new Uint8Array(1);
                uint8[0] = value;
                act( () =>{ callLastRegisteredCharacteristicValueChangeListener(emitterMock.addListener, uint8, mockPeripheral.id, "AA00",SERVICE_UUID);} );
                await flushMicrotasksQueue();
                await waitForElement(() => container.getByText("Battery: unknown"));
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
                      <EmitterContext.Provider value={emitterMock}>
                        <BatteryService peripheral={mockPeripheralNotSupportingNotifications} connected={true}/>
                      </EmitterContext.Provider>
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
                <EmitterContext.Provider value={emitterMock}>
                    <BatteryService peripheral={noNamedMockPeripheral} connected={false} onRemoval={removalCallbackMock} />
                </EmitterContext.Provider>
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

})

const callLastRegisteredCharacteristicValueChangeListener = (mock, value, peripheral, characteristic, service) => {
        const lastCall = findLastListenerCallFor('BleManagerDidUpdateValueForCharacteristic', mock);
        const characteristicChangeListener = mock.mock.calls[lastCall][1];
        characteristicChangeListener({value, peripheral, characteristic, service});
};


const findLastListenerCallFor =  (listenerName, mock) => {
      const callsFound = mock.mock.calls.map( (call, index) => call[0] == listenerName ? index : undefined);
      const callsFiltered = callsFound.filter(x => x !== undefined);
      const lastCall = callsFiltered.slice(-1)[0];
      return lastCall;
};
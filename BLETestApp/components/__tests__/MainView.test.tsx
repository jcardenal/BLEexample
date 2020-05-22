import React from 'react';
import {render, cleanup} from 'react-native-testing-library';
import MainView from '../MainView';
import ServicesList from '../ServicesList';

jest.mock('../ServicesList', () => jest.fn( () => null) );
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

describe("<MainView />", () => {

    afterEach(cleanup);

    describe("Structural tests", () => {
        it("should render App", () => {
            render( <MainView /> );
        });

        it("should contain 'BLE Test App' ", () => {
            const {getByText} = render( <MainView />);
            expect(getByText("BLE Test App")).toBeTruthy();
        });

        it("should contain 'Scan' button", () => {
            const {getByText} = render( <MainView />);
            expect(getByText("START SCAN")).toBeTruthy();
        });

        it("should contain list of services", () => {
            render( <MainView />)
            expect(ServicesList).toHaveBeenCalled();
        });
    })

})
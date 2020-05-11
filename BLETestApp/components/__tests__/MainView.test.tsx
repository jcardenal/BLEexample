import React from 'react';
import {render} from 'react-native-testing-library';
import MainView from '../MainView';
import ServicesList from '../ServicesList';

jest.mock('../ServicesList', () => jest.fn( () => null) );

describe("<MainView />", () => {
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
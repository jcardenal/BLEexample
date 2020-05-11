import React from 'react';
import {render} from 'react-native-testing-library';
import MainView from '../MainView';

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
    })

})
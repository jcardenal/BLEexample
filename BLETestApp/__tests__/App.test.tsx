import React from 'react';
import {render} from 'react-native-testing-library';
import App from '../App';

describe("<App />", () => {
        it("should render App", () => {
            render( <App /> );
        });
})
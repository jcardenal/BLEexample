# BLETestApp

Simple Android app to connect to BLE peripherals (this is the `central` in BLE parlance), implementing
the [Peripheral](../Peripheral/README.md) functionality.


# Development tools

* [expo](https://expo.io/), (and its [documentation](https://docs.expo.io/)), starting point for buiding the app
* [react-native](https://reactnative.dev/), (and its [documentation](https://reactnative.dev/docs/getting-started)) is also needed
in order to include 3rd party modules and libraries in the project
* [react-native-ble-manager](https://www.npmjs.com/package/react-native-ble-manager), this is the 3rd party library
needed to include BLE support
* [react-native-testing-library](https://github.com/callstack/react-native-testing-library), the `react-native` version of `react-testing-library`
* [jest-native](https://github.com/testing-library/jest-native), provides additional matchers as `toBeDisabled`, `toHaveProp`...
# Implemented behaviour

What does this BLE test App do? Well, not much. In addition, the behaviour was implemented
following a phased approach:

### Initial implementation

* Start/stop scanning for BLE peripherals implementing the `Battery Service` (see [Peripheral](../Peripheral/README.md))
* Connect to/disconnect from a found BLE peripheral
* Read the `Battery Level` characteristic from the peripheral, when connected

### Improvements (some of them already implemented)

* Control (write) the blinking frequency of the on-board blue led of the peripheral using a slider
 
 
# Interesting pointers
 
* Expo guides:
  * [Testing with Jest](https://docs.expo.io/guides/testing-with-jest/)
  * [Using Typescript](https://docs.expo.io/guides/typescript/)
  * [User Interface Component Libraries](https://docs.expo.io/guides/userinterface/)
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
* [buffer](https://github.com/feross/buffer), to manipulate byte conversions when reading/writing data

# Implemented behaviour

What does this BLE test App do? Well, not much. In addition, the behaviour was implemented
following a phased approach:

### Initial implementation

* [ ] Start/stop scanning for BLE peripherals implementing the `Battery Service` (see [Peripheral](../Peripheral/README.md))
* [ ] Connect to/disconnect from a found BLE peripheral
* [ ] Read the `Battery Level` characteristic from the peripheral, when connected

### Improvements (some of them already implemented)

* [ ] Control (write) the blinking frequency of the on-board blue led of the peripheral using a slider
* [ ] Display errors
* [ ] Check if bluetooth is enabled or not and ask for enablement when needed
* [ ] Check if location permit has been granted by user (see below)

# Executing the app

## While in `expo`

* use `npm run android` to run the application in a USB connected device
* `console.log` output can be seen following this procedure:
    1. Shake the device so the development menu is presented
    2. Choose the `Debug remote JS` option; this will open a tab on `Chrome`
    3. On the tab opened on `Chrome`, go to the console using the `Developer Tools` option
    
## After being ejected from `expo` 

**IMPORTANT NOTE:** Explicit permission to access location has to be granted by the user for this application to be able
to scan devices. For this, in `Settings > Apps and notifications > App permissions > Location Permissions` for the application,
the permissions have to be turned on.

Ejecting from `expo` can be repeated as many times as needed (for example, to regenerate the code after changes in JS code).
After the first ejection from `expo` and before repeating the eject, it is advisable to delete the `android/` and
`ios/` folders, and run `expo eject` again, and then:

* use `npx @expo/configure-splash-screen --platform "all" white ./assets/splash.png` to set the correct splash screen
* remember to include the required permissions and features for BLE access in `AndroidManifest.xml`:
            
            <uses-permission android:name="android.permission.BLUETOOTH"/>
            <uses-permission android:name="android.permission.BLUETOOTH_ADMIN"/>
            <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
            <uses-feature android:name="android.hardware.bluetooth_le" android:required="true" />

* create empty folder `android/app/src/main/assets` and use `npm run bundle` to avoid the problem pointed 
* use `npm run android` to run the application in a USB connected device
* use `npx react-native log-android` to see the `console.log` output

**If only the JS is changed**, a quicker method to update the application to be run in a device connected through USB is:

* After the change in JS is made, run `npm run bundle`
* then run `npm run android`


# Interesting pointers
 
* Expo guides:
  * [Testing with Jest](https://docs.expo.io/guides/testing-with-jest/)
  * [Using Typescript](https://docs.expo.io/guides/typescript/)
  * [User Interface Component Libraries](https://docs.expo.io/guides/userinterface/)
  
* Troubleshooting (after `expo eject`):
  * [Solved: Unable to load script from assets ‘index.android.bundle’](https://medium.com/@adityasingh_32512/solved-unable-to-load-script-from-assets-index-android-bundle-bdc5e3a3d5ff)
# Bluetooth Low Energy (BLE) example

Two projects are created:


* **Peripheral**, where the BLE peripheral is going to be created
* **BLETestApp**, an _Android_ application to access the data in the peripheral

## The general idea

**Peripheral** implements a BLE GATT server providing the _Battery Profile_ (information about the level of charge of the battery). This is accomplished using an _ESP32_ micro-controller running [micropython](https://micropython.org)

**BLETestApp** connects to any peripheral providing the _Battery Level_ BLE service and reads the value provided by the 
peripheral. Also subscribes to changes in the value (see detailed information and pointers to Bluetooth below). The application is built using [expo](https://expo.io), [react-native](https://reactnative.dev) and the _react-native_ library
[react-native-ble-manager](https://www.npmjs.com/package/react-native-ble-manager), **NOT INCLUDED IN THE `EXPO` SDK**

## Useful pointers

Before diving to the code, it can be convenient to read these pages

* [BLE Android's guide](https://developer.android.com/guide/topics/connectivity/bluetooth-le), a nice presentation on how
to use BLE in an _Android_ application

* [BLE GATT Specifications](https://www.bluetooth.com/specifications/gatt/), including profile specifications, where we can have access to [Services](https://www.bluetooth.com/specifications/gatt/services/), [Characteristics](https://www.bluetooth.com/specifications/gatt/characteristics/) and [Descriptors](https://www.bluetooth.com/specifications/gatt/descriptors/), with especial interest to the **Asigned Numbers**


* [Peripheral README](Peripheral/README.md)

* [BLETestApp README](BLETestApp/README.md)





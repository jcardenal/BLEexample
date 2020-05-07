# Peripheral

Simple implementation of a BLE GATT server providing a [Battery Service](https://www.bluetooth.org/docman/handlers/downloaddoc.ashx?doc_id=245138)

# Flashing ESP32

See [Getting started with MicroPython on the ESP32](https://docs.micropython.org/en/latest/esp32/tutorial/intro.html) tutorial

# Development tools

* [rshell](https://github.com/dhylands/rshell) to access the _ESP32_ and copy the required files
* [ubluetooth](https://docs.micropython.org/en/latest/library/ubluetooth.html) micropython module
* [mock](#Mock) see below


# Interesting pointers

* Regarding TDD & micropython:
 - [ESP32 Machine emulator](https://github.com/tflander/esp32-machine-emulator#esp32-machine-emulator), not very mature project yet, but promising 
 - [micropython unix porting](https://github.com/micropython/micropython#the-unix-version), also available on _Ubuntu_ as `snap install micropython`; _ubluetooth_ module not available

# Mock

As part of this project, a simple module to create mocks and ease TDD-ing the development of the main module has been developed

## Philosophy

The idea is inspired by the popular `mockito` library, available in `Java`. It should run using only the available functionality of the port of `micropython` to unix systems and the [`micropython-lib`](https://github.com/micropython/micropython-lib) available libraries. The library is intended to be used only on this interpreter while doing development on a linux box and **not on a real device**

### Why not to use `unittest.mock` package?

Good question! The problem is that the requirements for running `unittest.mock` on `micropython` seemed a little bit too-much to me. So, I decided to build something simpler, but powerful enough to allow for TDD-ing a development on `micropython`

## Use cases / requirements

* Create a mock object from a real `micropython` class:

		from mock import Mock, create_mock
		from bluetooth import BLE
		mockBLE = create_mock(BLE)
		assert isinstance(mockBLE, Mock)
		assert not isinstance(mockBLE, BLE)

* Set expected values to return on calls:

		mockBLE.when('active', return_value = True) # return True on mockBLE.active()

* Set expected values to return depending on arguments:

		mockBLE.when('active', (True,), return_value = True) # return True on mockBLE.active(True)
		mockBLE.when('active', return_value = False) # else, return False

* Set expectations on invocations on the mock:

		assert mockBLE.hasBeenCalled()
		assert mockBLE.hasBeenCalled(times = 3) # three times
		assert mockBLE.hasBeenCalled(method = 'active', times = 2) # BLE.active has been called twice
		assert mockBLE.hasBeenCalledWith(method = 'active', args) # BLE.active has been called with these parameters
		assert mockBLE.hasBeenCalledWith(method = 'active', args, times=2) # BLE.active has been called with these parameters, twice

* Mock reset:
		from mock import createMockFor
		from bluetooth import BLE
		mockBLE = createMockFor(BLE)
		mockBLE.active()
		assert mockBLE.hasBeenCalled()
		assert mockBLE.hasBeenCalledWith(method = 'active', (), times = 1)		
		mockBLE.reset()
		assert not mockBLE.hasBeenCalled()

* Set expectations on raising exceptions:
		mockBLE.when('active', (True,), raise=OSError) # raise OSError on mockBLE.active(True)

* [OPTIONAL] Set assertions on order of calls on the mock









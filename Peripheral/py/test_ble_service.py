"""
    Unit Tests for the ble_service module
"""

import unittest
from mock.mock import create_mock, Mock
from bluetooth import BLE, UUID, FLAG_READ, FLAG_NOTIFY
from ble_service import BatteryService, BATTERY_SERVICE_APPEARANCE
from ble_advertising import advertising_payload
from micropython import const

MOCK_BATTERY_LEVEL_HANDLE = 111

_IRQ_CENTRAL_CONNECT = const(1 << 0)
_IRQ_CENTRAL_DISCONNECT = const(1 << 1)


def _create_expected_services():
    battery_service_uuid = UUID(0x180F)
    battery_level_characteristic = (UUID(0x2A19), FLAG_NOTIFY | FLAG_READ,)
    battery_service = (battery_service_uuid, (battery_level_characteristic,),)
    return (battery_service,)


def _create_expected_advertising_payload():
    return advertising_payload(name='micropython-esp32', services=[UUID(0x180F)], appearance=BATTERY_SERVICE_APPEARANCE)


class BLEServiceTestCase(unittest.TestCase):
    def setUp(self):
        self.mockBLE = create_mock(BLE)
        self.mockBLE.when('gatts_register_services', return_value=((MOCK_BATTERY_LEVEL_HANDLE,),))

    def test_should_create_mock(self):
        self.assertIsInstance(self.mockBLE, Mock)

    def test_should_create_battery_service_with_BLE_on(self):
        service = BatteryService(self.mockBLE)
        self.assertIsNotNone(service)
        self.assertTrue(self.mockBLE.has_been_called_with('active', (True,), times=1))

    def test_should_register_BLE_battery_service_and_write_initial_value(self):
        service = BatteryService(self.mockBLE)
        expected_services = _create_expected_services()
        service.register_services()
        self.assertTrue(self.mockBLE.has_been_called_with('gatts_register_services', (expected_services,), times=1))
        self.assertTrue(self.mockBLE.has_been_called(method='gatts_write', times=1))

    def test_should_advertise_services(self):
        service = BatteryService(self.mockBLE)
        service.register_services()
        service.start()
        self.assertTrue(self.mockBLE.has_been_called_with('gap_advertise', {'interval_us': 500000,
                                                                            'adv_data': _create_expected_advertising_payload()},
                                                          times=1))

    def test_should_stop_advertising(self):
        service = BatteryService(self.mockBLE)
        service.register_services()
        service.start()
        service.stop()
        self.assertTrue(self.mockBLE.has_been_called_with('gap_advertise', (None,), times=1))

    def test_should_set_battery_level(self):
        service = BatteryService(self.mockBLE)
        service.register_services()
        service.set_battery_level_percentage(10)
        self.assertTrue(self.mockBLE.has_been_called_with('gatts_write', (MOCK_BATTERY_LEVEL_HANDLE, b'\x0A'), times=1))

    def test_should_set_only_allowed_battery_level_percentages(self):
        service = BatteryService(self.mockBLE)
        service.register_services()
        service.set_battery_level_percentage(0)
        self.assertTrue(self.mockBLE.has_been_called_with('gatts_write', (MOCK_BATTERY_LEVEL_HANDLE, b'\x00'), times=1))
        service.set_battery_level_percentage(-1)
        self.assertTrue(self.mockBLE.has_been_called_with('gatts_write', (MOCK_BATTERY_LEVEL_HANDLE, b'\x00'), times=2))
        service.set_battery_level_percentage(100)
        self.assertTrue(self.mockBLE.has_been_called_with('gatts_write', (MOCK_BATTERY_LEVEL_HANDLE, b'\x64'), times=1))
        service.set_battery_level_percentage(101)
        self.assertTrue(self.mockBLE.has_been_called_with('gatts_write', (MOCK_BATTERY_LEVEL_HANDLE, b'\x64'), times=2))

    def test_should_read_battery_level_percentage(self):
        self.mockBLE.when('gatts_read', (MOCK_BATTERY_LEVEL_HANDLE, ), return_value=b'\x0A')
        service = BatteryService(self.mockBLE)
        service.register_services()
        self.assertEqual(service.read_battery_level_percentage(), 10)

    def test_should_restart_advertising_after_disconnect(self):
        disconnect_data = (123, 'A_type', 'address')
        service = BatteryService(self.mockBLE)
        # testing 'private' method !!
        self.assertTrue(self.mockBLE.has_been_called(method='irq', times=1))
        service._irq_handler(_IRQ_CENTRAL_DISCONNECT, disconnect_data)
        self.assertTrue(self.mockBLE.has_been_called_with('gap_advertise', {'interval_us': 500000,
                                                                        'adv_data': _create_expected_advertising_payload()},
                                                      times=1))

    def test_should_restart_advertising_after_connect(self):
        connect_data = (124, 'A_type', 'address')
        service = BatteryService(self.mockBLE)
        # testing 'private' method !!
        self.assertTrue(self.mockBLE.has_been_called(method='irq', times=1))
        service._irq_handler(_IRQ_CENTRAL_CONNECT, connect_data)
        self.assertTrue(self.mockBLE.has_been_called_with('gap_advertise', {'interval_us': 500000,
                                                                            'adv_data': _create_expected_advertising_payload()},
                                                          times=1))

if __name__ == '__main__':
    unittest.main()

"""
    Unit Tests for the ble_service module
"""

import unittest
from mock.mock import create_mock, Mock
from bluetooth import BLE, UUID, FLAG_READ, FLAG_NOTIFY
from ble_service import BatteryService


def _create_expected_services():
    battery_service_uuid = UUID(0x180F)
    battery_level_characteristic = (UUID(0x2A19), FLAG_NOTIFY | FLAG_READ,)
    battery_service = (battery_service_uuid, (battery_level_characteristic,),)
    return (battery_service,)


class BLEServiceTestCase(unittest.TestCase):
    def setUp(self):
        self.mockBLE = create_mock(BLE)
        self.mockBLE.when('gatts_register_services', return_value=((111,),))

    def test_should_create_mock(self):
        self.assertIsInstance(self.mockBLE, Mock)

    def test_should_create_battery_service_with_BLE_on(self):
        service = BatteryService(self.mockBLE)
        self.assertIsNotNone(service)
        self.assertTrue(self.mockBLE.has_been_called_with('active', (True,), times=1))

    def test_should_register_BLE_battery_service_and_write_value(self):
        service = BatteryService(self.mockBLE)
        expected_services = _create_expected_services()
        service.register_services()
        self.assertTrue(self.mockBLE.has_been_called_with('gatts_register_services', (expected_services,), times=1))
        self.assertTrue(self.mockBLE.has_been_called(method='gatts_write', times=1))

    def test_should_advertise_services(self):
        service = BatteryService(self.mockBLE)
        service.register_services()
        service.start()
        self.assertTrue(self.mockBLE.has_been_called_with('gap_advertise', (625,), times=1))

    def test_should_stop_advertising(self):
        service = BatteryService(self.mockBLE)
        service.register_services()
        service.start()
        service.stop()
        self.assertTrue(self.mockBLE.has_been_called_with('gap_advertise', (None,), times=1))

    def test_should_set_handler_for_events(self):
        service = BatteryService(self.mockBLE)
        service.register_services()

        def bt_irq():
            pass

        service.start(bt_irq)
        self.assertTrue(self.mockBLE.has_been_called_with('irq', (bt_irq,), times=1))


if __name__ == '__main__':
    unittest.main()

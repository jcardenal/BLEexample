"""
    Unit Tests for the voltage_reader module
"""

import unittest
from mock.mock import create_mock, Mock
from voltage_reader import VoltageReader
from ble_service import BatteryService

# mock ADC locally
class ADC:

    def read(self):
        pass

    def atten(self):
        pass

    def width(self):
        pass

_MOCK_UPPER_LIMIT = 511

class VoltageReaderTestCase(unittest.TestCase):
    def setUp(self):
        self.mockADC = create_mock(ADC)
        self.mockADC.when('read', return_value=_MOCK_UPPER_LIMIT)
        self.mockBS = create_mock(BatteryService)

    def test_should_create_mock(self):
        self.assertIsInstance(self.mockADC, Mock)

    def test_should_create_voltage_reader_with_correct_upper_limit(self):
        voltage_reader = VoltageReader(self.mockADC, _MOCK_UPPER_LIMIT)
        self.assertIsNotNone(voltage_reader)
        self.assertFalse(self.mockADC.has_been_called())

    def test_should_read_voltage(self):
        voltage_reader = VoltageReader(self.mockADC, _MOCK_UPPER_LIMIT)
        self.assertFalse(self.mockADC.has_been_called(method='read'))
        voltage_reader.refresh()
        self.assertTrue(self.mockADC.has_been_called(method='read', times=1))

    def test_should_refresh_battery_service_with_percentage(self):
        voltage_reader = VoltageReader(self.mockADC, _MOCK_UPPER_LIMIT)
        self.assertFalse(self.mockADC.has_been_called(method='set_battery_level_percentage'))
        voltage_reader.refresh(self.mockBS)
        self.assertTrue(self.mockBS.has_been_called_with('set_battery_level_percentage', (100,), times=1))

    def test_should_not_refresh_battery_service_if_no_read_change(self):
        voltage_reader = VoltageReader(self.mockADC, _MOCK_UPPER_LIMIT)
        self.assertFalse(self.mockADC.has_been_called(method='set_battery_level_percentage'))
        voltage_reader.refresh(self.mockBS)
        self.assertTrue(self.mockBS.has_been_called_with('set_battery_level_percentage', (100,), times=1))
        voltage_reader.refresh(self.mockBS)
        self.assertFalse(self.mockBS.has_been_called_with('set_battery_level_percentage', (100,), times=2))

    def test_should_return_last_read(self):
        voltage_reader = VoltageReader(self.mockADC, _MOCK_UPPER_LIMIT)
        self.assertIsNone(voltage_reader.last_read)
        voltage_reader.refresh(self.mockBS)
        self.assertEqual(voltage_reader.last_read, _MOCK_UPPER_LIMIT)


if __name__ == '__main__':
    unittest.main()

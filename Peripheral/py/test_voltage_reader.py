"""
    Unit Tests for the voltage_reader module
"""

import unittest
from mock.mock import create_mock, Mock
from voltage_reader import VoltageReader


# mock ADC locally
class ADC:
    pass


class VoltageReaderTestCase(unittest.TestCase):
    def setUp(self):
        self.mockADC = create_mock(ADC)

    def test_should_create_mock(self):
        self.assertIsInstance(self.mockADC, Mock)

    def test_should_create_voltage_reader(self):
        voltage_reader = VoltageReader(self.mockADC)
        self.assertIsNotNone(voltage_reader)
        self.assertFalse(self.mockADC.has_been_called())

if __name__ == '__main__':
    unittest.main()

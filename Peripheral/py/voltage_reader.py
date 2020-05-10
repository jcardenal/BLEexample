"""
    Voltage reader using ADC
"""


class VoltageReader:

    def __init__(self, adc, upper_limit):
        self.adc = adc
        self.upper_limit = upper_limit
        self.last_read = None

    def refresh(self, battery_service=None):
        voltage = self.adc.read()
        if not self.last_read == voltage:
            self.last_read = voltage
            percentage = voltage / self.upper_limit * 100
            if battery_service is not None:
                battery_service.set_battery_level_percentage(percentage)

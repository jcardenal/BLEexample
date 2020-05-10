from bluetooth import BLE
from ble_service import BatteryService
from voltage_reader import VoltageReader
from machine import Pin, ADC, Timer

_ADC_PIN = 32
_ADC_UPPER_LIMIT = 511
_TIMER_PERIOD_IN_MS = 2000


def create_battery_service():
    service = BatteryService(BLE())
    service.register_services()
    service.start()
    return service


def create_voltage_reader():
    adc = ADC(Pin(_ADC_PIN))
    adc.atten(ADC.ATTN_11DB)  # set 11dB input attenuation (voltage range roughly 0.0v - 3.6v)
    adc.width(ADC.WIDTH_9BIT)  # set 9 bit return values (returned range 0-511)
    voltage_reader = VoltageReader(adc, _ADC_UPPER_LIMIT)
    return voltage_reader


def boot_service(battery_service, voltage_reader):
    def refresh_callback(t):
        voltage_reader.refresh(battery_service)

    tim = Timer(-1)
    tim.init(period=_TIMER_PERIOD_IN_MS, mode=Timer.PERIODIC, callback=refresh_callback)


if __name__ == '__main__':
    boot_service(create_battery_service(), create_voltage_reader())

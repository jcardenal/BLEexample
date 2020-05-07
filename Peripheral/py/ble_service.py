"""
    Simple BLE example
"""
from bluetooth import UUID, FLAG_READ, FLAG_NOTIFY
from micropython import const

_IRQ_CENTRAL_CONNECT = const(1 << 0)
_IRQ_CENTRAL_DISCONNECT = const(1 << 1)
_IRQ_GATTS_WRITE = const(1 << 2)
_IRQ_GATTS_READ_REQUEST = const(1 << 3)
_IRQ_SCAN_RESULT = const(1 << 4)
_IRQ_SCAN_COMPLETE = const(1 << 5)
_IRQ_PERIPHERAL_CONNECT = const(1 << 6)
_IRQ_PERIPHERAL_DISCONNECT = const(1 << 7)
_IRQ_GATTC_SERVICE_RESULT = const(1 << 8)
_IRQ_GATTC_CHARACTERISTIC_RESULT = const(1 << 9)
_IRQ_GATTC_DESCRIPTOR_RESULT = const(1 << 10)
_IRQ_GATTC_READ_RESULT = const(1 << 11)
_IRQ_GATTC_WRITE_STATUS = const(1 << 12)
_IRQ_GATTC_NOTIFY = const(1 << 13)
_IRQ_GATTC_INDICATE = const(1 << 14)


def _create_battery_service():
    battery_service_uuid = UUID(0x180F)
    battery_level_characteristic = (UUID(0x2A19), FLAG_NOTIFY | FLAG_READ,)
    return battery_service_uuid, (battery_level_characteristic,),


def _create_services():
    return _create_battery_service(),


class BatteryService:
    def __init__(self, ble):
        self.bt = ble
        self.bt.active(True)

    def register_services(self):
        ((battery_level_value_handle,),) = self.bt.gatts_register_services(_create_services())
        self.bt.gatts_write(battery_level_value_handle, 50)

    def start(self, event_handler=None):
        self.bt.gap_advertise(625)
        if event_handler is not None:
            self.bt.irq(event_handler)

    def stop(self):
        self.bt.gap_advertise(None)

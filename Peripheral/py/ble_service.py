"""
    Simple BLE example
"""
from bluetooth import UUID, FLAG_READ, FLAG_NOTIFY
from micropython import const
from ble_advertising import advertising_payload
from struct import pack, unpack

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

BATTERY_SERVICE_APPEARANCE = const(3264)  # Generic Personal Mobility Device


def _create_battery_service():
    battery_service_uuid = UUID(0x180F)
    battery_level_characteristic = (
        UUID(0x2A19), FLAG_NOTIFY | FLAG_READ,)  # type org.bluetooth.characteristic.battery_level, uint8 0-100
    return battery_service_uuid, (battery_level_characteristic,),


def _create_services():
    return _create_battery_service(),


def _create_advertising_payload():
    return advertising_payload(name='micropython-esp32', services=[UUID(0x180F)], appearance=BATTERY_SERVICE_APPEARANCE)


class BatteryService:
    def __init__(self, ble):
        self.bt = ble
        self.bt.active(True)
        self.bt.irq(handler=self._irq_handler)
        self._connected_centrals = set()

    def register_services(self):
        ((self.battery_level_value_handle,),) = self.bt.gatts_register_services(_create_services())
        self.bt.gatts_write(self.battery_level_value_handle, b'\x32')

    def start(self):
        self.bt.gap_advertise(interval_us=500000, adv_data=_create_advertising_payload())

    def stop(self):
        self.bt.gap_advertise(None)

    def set_battery_level_percentage(self, raw_percentage):
        packed_value = pack('B', self._round_and_limit_percentage(raw_percentage))
        self.bt.gatts_write(self.battery_level_value_handle, packed_value)
        for central in self._connected_centrals:
            self.bt.gatts_notify(central, self.battery_level_value_handle, packed_value)

    def read_battery_level_percentage(self):
        value, = unpack('B', self.bt.gatts_read(self.battery_level_value_handle))
        return value

    def connected_centrals(self):
        return len(self._connected_centrals)

    def _round_and_limit_percentage(self, raw_percentage):
        percentage = int(round(raw_percentage))
        if percentage < 0:
            value = 0
        elif percentage > 100:
            value = 100
        else:
            value = percentage
        return value

    def _irq_handler(self, event, data):
        if event == _IRQ_CENTRAL_DISCONNECT:
            conn_handle, _, _, = data
            if conn_handle in self._connected_centrals:
                self._connected_centrals.remove(conn_handle)
            self.start()
        elif event == _IRQ_CENTRAL_CONNECT:
            conn_handle, _, _, = data
            self._connected_centrals.add(conn_handle)
            self.start()

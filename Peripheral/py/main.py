from bluetooth import BLE
from ble_service import BatteryService

if __name__ == '__main__':
    service = BatteryService(BLE())
    service.register_services()
    service.start()
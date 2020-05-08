from bluetooth import BLE
from ble_service import BatteryService


def boot_service():
    service = BatteryService(BLE())
    service.register_services()
    service.start()
    return service


if __name__ == '__main__':
    boot_service()

import React, {useState, useEffect, useContext} from 'react';
import {Text, StyleSheet, Switch, View} from 'react-native';
import { Button } from 'react-native-material-ui';
import BleManager from 'react-native-ble-manager';
import Buffer from 'buffer';
import {EmitterContext} from '../App';

export const SERVICE_UUID = "180F";
export const CHARACTERISTIC_UUID = "2A19";

const decodeBytes = readData => {
      const buffer = Buffer.Buffer.from(readData);
      const decoded = buffer.readUInt8(0,true);
      return decoded;
};

const BatteryService = ({peripheral, connected, onRemoval}) => {
    const emitter = useContext(EmitterContext);

    const [percentage, setPercentage] = useState<String>("unknown")
    const [isNotifying, setIsNotifying] = useState<Boolean>(false);


    useEffect(() => {
          emitter.addListener('BleManagerDidUpdateValueForCharacteristic', (args) => {
                  console.log("Characteristic value changed in peripheralId: ", args.peripheral, args.characteristic, args.service, args.value);
                  if ((extractFromUUID(args.characteristic) === CHARACTERISTIC_UUID) &&
                      (extractFromUUID(args.service) === SERVICE_UUID) &&
                      ( peripheral.id === args.peripheral)) {
                      setPercentage(`${decodeBytes(args.value)}%`);
                  }
          });
    }, [])

    const getButtonText = () =>  (connected ? "DISCONNECT" : "CONNECT")

    const handleConnectButtonPressed = async () => {
        if (connected) {
            if (isNotifying) {
               await BleManager.stopNotification(peripheral.id, SERVICE_UUID, CHARACTERISTIC_UUID);
               setIsNotifying(false);
            }
            await BleManager.disconnect(peripheral.id);
        } else {
            await BleManager.connect(peripheral.id);
        }
    }

    const handleReadButton = () => {
        BleManager.read(peripheral.id, SERVICE_UUID, CHARACTERISTIC_UUID)
            .then((readData) => {
                console.log("Read: ", readData);
                setPercentage(`${decodeBytes(readData)}%`);
            })
            .catch((error) => {
                console.log("Error reading:", error);
            });
    }

    const handleRemoveButton = async () => {
        await BleManager.disconnect(peripheral.id);
        await BleManager.removePeripheral(peripheral.id);
        onRemoval(peripheral.id);
    }

    const supportsNotification = characteristics => {
        return (characteristics !== undefined) &&
                        characteristics.filter( c => (c.service === '180f') &&
                        (c.characteristic === '2a19') &&
                        (c.properties.Notify === 'Notify')).length > 0 ;
    };

    const manageNotificationSubscriptions = async (shouldNotify) => {
             if (shouldNotify) {
               console.log("Starting notification reception");
               await BleManager.retrieveServices(peripheral.id, [SERVICE_UUID]);
               await BleManager.startNotification(peripheral.id, SERVICE_UUID, CHARACTERISTIC_UUID);
             } else {
               console.log("Stopping notification reception")
               await BleManager.stopNotification(peripheral.id, SERVICE_UUID, CHARACTERISTIC_UUID);
             }
    };

    const toggleSwitch = (value) => {
                setIsNotifying(value);
                manageNotificationSubscriptions(value);
    };

    return (
    <View style={styles.container}>
        <Text style={styles.baseText} >{peripheral.name ? peripheral.name : 'N/A'}</Text>
        <Text style={styles.batteryText} >Battery: {percentage}</Text>
        {
          supportsNotification(peripheral.characteristics) ?
          (
           <View style={styles.innerContainer}>
            <Text>Notify me!</Text>
            <Switch
                testID="toggleSwitch"
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isNotifying && connected ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isNotifying && connected}
                disabled={!connected}
            />
          </View>
          )
          : null
        }
        <View style={styles.buttonsContainer}>
            <Button primary raised text={getButtonText()} onPress={handleConnectButtonPressed} />
            <Button disabled={!connected} accent raised text="read" onPress={handleReadButton}/>
            <Button raised text="remove" onPress={handleRemoveButton} />
        </View>
    </View>
    )
}

BatteryService.defaultProps = {
    onRemoval: () => {}
};

const styles = StyleSheet.create({
  baseText: {
    fontFamily: "Cochin",
    fontSize: 20,
    fontWeight: "bold"
  },
  batteryText: {
    fontSize: 16,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    borderColor: "green",
    borderWidth: 2,
    borderRadius: 20,
    padding: 10,
  },
  innerContainer: {
    flex: 1,
    flexDirection: "row",
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: "space-evenly",
    padding: 10,
  }
});

const extractFromUUID = uuid => uuid && uuid.split("-")[0].slice(-4).toUpperCase()

export default BatteryService;
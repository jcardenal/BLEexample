import React, {useState, useEffect, useContext} from 'react';
import {Text, StyleSheet, Switch, View} from 'react-native';
import { Button } from 'react-native-material-ui';
import BleManager from 'react-native-ble-manager';
import Buffer from 'buffer';

export const SERVICE_UUID = "180F";
export const CHARACTERISTIC_UUID = "2A19";

const BatteryService = ({peripheral, connected, onRemoval, level}) => {
    const [percentage, setPercentage] = useState<String>(level ? `${level}%` : "unknown")
    const [isNotifying, setIsNotifying] = useState<Boolean>(false);

    const getButtonText = () =>  (connected ? "DISCONNECT" : "CONNECT")

    const handleConnectButtonPressed = async () => {
        if (connected) {
            await BleManager.disconnect(peripheral.id);
        } else {
            await BleManager.connect(peripheral.id);
        }
    }

    const handleReadButton = () => {
        BleManager.read(peripheral.id, SERVICE_UUID, CHARACTERISTIC_UUID)
            .then((readData) => {
                console.log("Read: ", readData);
                const buffer = Buffer.Buffer.from(readData);
                const batteryLevel = buffer.readUInt8(0,true);
                setPercentage(`${batteryLevel}%`);
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
        result = (characteristics !== undefined) && characteristics.filter( c => (c.service === '180f') && (c.characteristic === '2a19') && (c.properties.Notify === 'Notify')).length > 0 ;
        console.log('Considering Characteristics: ', characteristics);
        console.log('Characteristic supports notification: ', result);
        return result;
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
           <>
            <Switch
                testID="toggleSwitch"
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isNotifying ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isNotifying}
                disabled={!connected}
            />
            <Text>Notify me!</Text>
           </>
          )
          : null
        }

        <Button primary raised text={getButtonText()} onPress={handleConnectButtonPressed} />
        <Button disabled={!connected} accent raised text="read" onPress={handleReadButton}/>
        <Button raised text="remove" onPress={handleRemoveButton} />
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
    borderColor: "green",
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
  }
});


export default BatteryService;
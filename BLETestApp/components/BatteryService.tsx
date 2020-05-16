import React, {useState, useEffect, useContext} from 'react';
import {Text, StyleSheet, View} from 'react-native';
import { Button } from 'react-native-material-ui';
import BleManager from 'react-native-ble-manager';
import Buffer from 'buffer';

export const SERVICE_UUID = "180F";
const CHARACTERISTIC_UUID = "2A19";

const BatteryService = ({peripheral, connected}) => {
    const [connectButtonDisabled, setConnectButtonDisabled] = useState<Boolean>(false)
    const [percentage, setPercentage] = useState<String>("unknown")
    const getButtonText = () =>  (connected ? "DISCONNECT" : "CONNECT")

    const handleConnectButtonPressed = () => {
        if (connected) {
            setConnectButtonDisabled(true);
            BleManager.disconnect(peripheral.id)
                .then(() => setConnectButtonDisabled(false));
        } else {
            setConnectButtonDisabled(true);
            BleManager.connect(peripheral.id)
                .then(() => setConnectButtonDisabled(false));
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

    return (
    <View style={styles.container}>
        <Text style={styles.baseText} >{peripheral.name ? peripheral.name : 'N/A'}</Text>
        <Text style={styles.batteryText} >Battery: {percentage}</Text>
        <Button disabled={connectButtonDisabled} primary raised text={getButtonText()} onPress={handleConnectButtonPressed} />
        <Button disabled={!connected} accent raised text="read" onPress={handleReadButton}/>
    </View>
    )
}

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
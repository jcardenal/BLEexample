import React, {useState, useEffect, useContext} from 'react';
import {Text} from 'react-native';
import { Button, Card } from 'react-native-material-ui';
import BleManager from 'react-native-ble-manager';
import Buffer from 'buffer';

const SERVICE_UUID = "";
const CHARACTERISTIC_UUID = "";

const BatteryService = ({peripheral, connected}) => {
    const [connectButtonDisabled, setConnectButtonDisabled] = useState<Boolean>(false)
    const [percentage, setPercentage] = useState<String>("unknown")
    const getButtonText = () =>  (connected ? "DISCONNECT" : "CONNECT")

    const handleConnectButtonPressed = () => {
        if (connected) {
            setConnectButtonDisabled(true);
            BleManager.disconnect(peripheral.id);
        } else {
            setConnectButtonDisabled(true);
            BleManager.connect(peripheral.id);
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
    <Card>
        <Text>{peripheral.name ? peripheral.name : 'N/A'}</Text>
        <Text>Battery: {percentage}</Text>
        <Button disabled={connectButtonDisabled} raised text={getButtonText()} onPress={handleConnectButtonPressed} />
        <Button disabled={!connected} text="read" onPress={handleReadButton}/>
    </Card>
    )
}

export default BatteryService;
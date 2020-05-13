import React, {useState, useEffect, useContext} from 'react';
import {Text} from 'react-native';
import { Button, Card } from 'react-native-material-ui';
import {EmitterContext} from '../App';


const BatteryService = ({sname, onRead}) => {
    const [connected, setConnected] = useState<Boolean>(false)
    const [percentage, setPercentage] = useState<String>("unknown")
    const getButtonText = () =>  (connected ? "DISCONNECT" : "CONNECT")

    const emitter = useContext(EmitterContext);

    useEffect(() => {
             emitter.addListener('BleManagerConnectPeripheral', () => {});
             emitter.addListener('BleManagerDisconnectPeripheral', () => {});
    }, []);

    const handleConnectButton = () => {
        connected ? setConnected(false) : setConnected(true)
    }

    const handleReadButton = () => {
        setPercentage(onRead()+"%")
    }

    return (
    <Card>
        <Text>{sname}</Text>
        <Text>Battery: {percentage}</Text>
        <Button raised text={getButtonText()} onPress={handleConnectButton} />
        <Button disabled={!connected} text="read" onPress={handleReadButton}/>
    </Card>
    )
}

BatteryService.defaultProps = {
    sname: 'N/A',
    onRead: () => "unknown"
}

export default BatteryService;
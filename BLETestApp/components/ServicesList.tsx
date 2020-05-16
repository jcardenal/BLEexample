import React, {useState, useEffect, useContext} from 'react';
import {ScrollView, Text, StyleSheet} from 'react-native'
import BatteryService from './BatteryService';
import BleManager from 'react-native-ble-manager';
import {EmitterContext} from '../App';

const ServicesList = () => {
    const emitter = useContext(EmitterContext);
    const [peripherals, setPeripherals] = useState(new Map());

    const changePeripheralConnectionStatus = (peripheralId, status) =>{
            let peripheral = peripherals.get(peripheralId);
            if (peripheral) {
                peripheral = {...peripheral, connected: status};
                setPeripherals(new Map(peripherals.set(peripheralId, peripheral)));
                if (status) {
                    BleManager.retrieveServices(peripheralId)
                        .then((peripheralInfo) => {
                            console.log('Peripheral Info: ', peripheralInfo);
                        });
                }
            }
    }

    useEffect(()=>{
          emitter.addListener('BleManagerDiscoverPeripheral', (foundPeripheral) => {
                    const peripheral = { ...foundPeripheral, connected: false };
                    console.log(`Discovered peripheral: ${peripheral.id} - ${peripheral.name}`);
                    setPeripherals(new Map(peripherals.set(peripheral.id, peripheral)));
          });
          emitter.addListener('BleManagerConnectPeripheral', ({peripheral, status}) => {
                    console.log('Connected peripheralId: ', peripheral);
                    changePeripheralConnectionStatus(peripheral, true);
          });
          emitter.addListener('BleManagerDisconnectPeripheral', ({peripheral, status}) => {
                    console.log("Disconnected peripheralId: ", peripheral);
                    changePeripheralConnectionStatus(peripheral, false);
          });
    }, []);

    const drawPeripherals = () => {
        return [...peripherals.keys()].map(k => (
                    <BatteryService key={k}
                        peripheral={peripherals.get(k)}
                        connected={peripherals.get(k).connected}
                    />));
    }

    return (
        <ScrollView style={styles.container}>
            {drawPeripherals()}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 10,
  },
});

export default ServicesList;
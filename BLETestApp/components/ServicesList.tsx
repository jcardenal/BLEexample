import React, {useState, useEffect, useContext} from 'react';
import {ScrollView, Text} from 'react-native'
import BatteryService from './BatteryService';
import {EmitterContext} from '../App';

const ServicesList = () => {
    const emitter = useContext(EmitterContext);
    const [peripherals, setPeripherals] = useState(new Map());

    useEffect(()=>{
          emitter.addListener('BleManagerDiscoverPeripheral', (id, name, rssi, advertising) => {
                    peripheral = { ...{}, id, name, rssi, advertising, connected: false };
                    console.log('Discovered peripheral: ', peripheral);
                    setPeripherals(new Map(peripherals.set(id, peripheral)));
          });
          emitter.addListener('BleManagerConnectPeripheral', (peripheralId, status) => {
                    console.log('Connected peripheralId: ', peripheralId);
                    peripheral = peripherals.get(peripheralId);
                    if (peripheral) {
                        peripheral = {...peripheral, connected: true};
                        setPeripherals(new Map(peripherals.set(peripheralId, peripheral)));
                    }
          });
          emitter.addListener('BleManagerDisconnectPeripheral', () => {});
    }, []);

    const drawPeripherals = () => {
        return [...peripherals.keys()].map(k => (
                    <BatteryService
                        peripheral={peripherals.get(k)}
                        connected={peripherals.get(k).connected}
                    />));
    }

    return (
        <ScrollView>
            {drawPeripherals()}
        </ScrollView>
    )
}


export default ServicesList;
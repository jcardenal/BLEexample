import React, {useState, useEffect, useContext} from 'react';
import {ScrollView, Text} from 'react-native'
import BatteryService from './BatteryService';
import {EmitterContext} from '../App';

const ServicesList = () => {
    const emitter = useContext(EmitterContext);
    const [peripherals, setPeripherals] = useState(new Map());

    useEffect(()=>{
          emitter.addListener('BleManagerDiscoverPeripheral', (id, name, rssi, advertising) => {
                    peripheral = { ...{}, id, name, rssi, advertising };
                    console.log('Discovered peripheral: ', peripheral);
                    setPeripherals(new Map(peripherals.set(id, peripheral)));
                 }
          );
    }, []);

    const drawPeripherals = () => {
        return [...peripherals.keys()].map(k => (<BatteryService peripheral={peripherals.get(k)} />));
    }

    return (
        <ScrollView>
            {drawPeripherals()}
        </ScrollView>
    )
}


export default ServicesList;
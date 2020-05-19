import React, {useState, useEffect, useContext} from 'react';
import { Button } from 'react-native-material-ui';
import BleManager from 'react-native-ble-manager';
import {EmitterContext} from '../App';
import {SERVICE_UUID} from './BatteryService';


export const SCAN_PERIOD_IN_SECONDS = 5;

const ScanningButton = () => {
  const [scanning, setScanning] = useState<Boolean>(false)
  const [buttonText, setButtonText] = useState<String>("Start Scan")
  const emitter = useContext(EmitterContext)

  useEffect(() => {
        emitter.addListener('BleManagerStopScan', () => {
                console.log('Scan Stopped');
                setScanning(false);
                setButtonText("Start Scan");
             }
        );
  }, []);

  const handleButtonPressed = () => {
    if (scanning) {
        BleManager.stopScan()
        .then(() => {
            console.log('BLE Scan stopped');
          });
        setScanning(false);
        setButtonText("Start Scan");
    } else {
        BleManager.scan([SERVICE_UUID], SCAN_PERIOD_IN_SECONDS, true)
          .then(() => {
            console.log('BLE Scan started');
          });
        setScanning(true);
        setButtonText("Stop Scan")
    }
  }
  return ( <Button raised primary text={buttonText} onPress={handleButtonPressed}/> )
}

export default ScanningButton;
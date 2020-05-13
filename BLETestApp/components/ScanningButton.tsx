import React, {useState, useEffect, useContext} from 'react';
import { Button } from 'react-native-material-ui';
import BleManager from 'react-native-ble-manager';
import {EmitterContext} from '../App';

export const SCAN_PERIOD_IN_SECONDS = 5;

const ScanningButton = () => {
  const [scanning, setScanning] = useState<Boolean>(false)
  const [buttonText, setButtonText] = useState<String>("Start Scan")
  const emitter = useContext(EmitterContext)

  useEffect(() => {
        emitter.addListener('BleManagerStopScan', () => {});
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
        BleManager.scan([], SCAN_PERIOD_IN_SECONDS, true)
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
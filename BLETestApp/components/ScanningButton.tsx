import React, {useState} from 'react';
import { Button } from 'react-native-material-ui';

const ScanningButton = ({startScan, stopScan}) => {
  const [scanning, setScanning] = useState<Boolean>(false)
  const [buttonText, setButtonText] = useState<String>("Start Scan")

  const handleButtonPressed = () => {
    if (scanning) {
        stopScan();
        setScanning(false);
        setButtonText("Start Scan");
    } else {
        startScan();
        setScanning(true);
        setButtonText("Stop Scan")
    }
  }
  return ( <Button raised primary text={buttonText} onPress={handleButtonPressed}/> )
}

ScanningButton.defaultProps = {
    startScan: () => {},
    stopScan: () => {}
}

export default ScanningButton;
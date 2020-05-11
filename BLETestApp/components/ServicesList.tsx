import React, {useState} from 'react';
import {ScrollView} from 'react-native'
import BatteryService from './BatteryService';

const ServicesList = ({list}) => {

    return (
    <ScrollView>
    {list.map(name => <BatteryService sname={name} />)}
    </ScrollView>
    )
}

export default ServicesList;
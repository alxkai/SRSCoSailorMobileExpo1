import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Footer = () => {
  return (
    <View className="bg-white py-2 px-4 flex-row justify-between items-center">
      <TouchableOpacity>
        <Ionicons name="home-outline" size={24} color="gray" />
      </TouchableOpacity>
      <TouchableOpacity>
        <Ionicons name="list-outline" size={24} color="gray" />
      </TouchableOpacity>
      <TouchableOpacity className="bg-blue-600 rounded-full p-3 -mt-8">
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
      <TouchableOpacity>
        <Ionicons name="notifications-outline" size={24} color="gray" />
      </TouchableOpacity>
      <TouchableOpacity>
        <Ionicons name="person-outline" size={24} color="gray" />
      </TouchableOpacity>
    </View>
  );
};

export default Footer;


import React from 'react';
import { SafeAreaView, View, Text, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { TailwindProvider } from 'tailwindcss-react-native';
import Footer from '~/components/Footer';
import ActionableItem from '~/components/ActionableItem';

type Priority = 'High' | 'Medium' | 'Low';

const actionableItems: { id: number; title: string; priority: Priority }[] = [
  { id: 1, title: 'Review Q2 Sales Report', priority: 'High' },
  { id: 2, title: 'Schedule Team Meeting', priority: 'Medium' },
  { id: 3, title: 'Follow up with Key Accounts', priority: 'High' },
  { id: 4, title: 'Prepare Monthly Forecast', priority: 'Medium' },
  { id: 5, title: 'Training Session: New Products', priority: 'Low' },
];

export default function App() {
  return (
    <TailwindProvider>
      <SafeAreaView className="flex-1 bg-gray-100">
        <StatusBar style="auto" />
        <ScrollView className="flex-1 px-4 py-2">
          <Text className="text-2xl font-bold mb-4">Actionable Items</Text>
          {actionableItems.map((item) => (
            <ActionableItem key={item.id} title={item.title} priority={item.priority} />
          ))}
        </ScrollView>
        <Footer />
      </SafeAreaView>
    </TailwindProvider>
  );
}
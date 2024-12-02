import React, { useContext } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '~/components/ui/text';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { DataContext } from './contexts/DataContext';

export function CustomerInsights() {
  const { customerInsights = [] } = useContext(DataContext) || {};
  
  // Add console log to check data
  console.log('Customer Insights Data:', customerInsights);
  
  const badgeColors = {
    "Low Digital Revenue Pct": "default",
    "Purchase Frequency Drop": "secondary",
    "Churn Risk": "destructive",
    "Upsell Opportunity": "default",
    "Late Payments": "destructive",
    "Order Inactivity": "secondary",
    "Purchase Potential": "default",
    "Net New Customer": "default",
    "Customer Journey": "secondary",
  };

  const aggregateInsights = [
    {
      insight_type: "Churn Risk",
      customers: [
        { custcd: "1", customer: "Customer A" },
        { custcd: "2", customer: "Customer B" },
      ]
    }
  ];

  return (
    <Card className="w-full max-w-sm rounded-2xl">
      <CardHeader>
        <CardTitle><Text>Insights</Text></CardTitle>
        <CardDescription><Text>Customers filtered by insight</Text></CardDescription>
        <View className="mt-4">
          {aggregateInsights.map((insight) => (
            <View key={insight.insight_type} className="py-3">
              <Badge variant={badgeColors[insight.insight_type] || "default"}>
                <Text>{insight.insight_type}</Text>
              </Badge>
              <ScrollView className="h-[410px] border rounded-md mt-2">
                <View className="p-4">
                  {insight.customers.map((customer) => (
                    <React.Fragment key={customer.custcd}>
                      <Text className="text-sm">{customer.customer}</Text>
                      <Separator className="my-1.5" />
                    </React.Fragment>
                  ))}
                </View>
              </ScrollView>
            </View>
          ))}
        </View>
      </CardHeader>
      <CardFooter />
    </Card>
  );
}
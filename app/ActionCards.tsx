import React, { useState } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { Calendar } from '@marceloterreiro/flash-calendar';
import { Mail } from '~/lib/icons/Mail';
import { Phone } from '~/lib/icons/Phone';
import { X } from '~/lib/icons/X';

import { Badge } from "~/components/ui/shadcn/badge";
import { Button } from "~/components/ui/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "~/components/ui/shadcn/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/shadcn/dialog";
import { Input } from "~/components/ui/shadcn/input";
import { Label } from "~/components/ui/shadcn/label";
import { Textarea } from "~/components/ui/shadcn/textarea";

// Define types
interface ActionCard {
  id: number;
  customerName: string;
  type: string;
  description: string;
  urgency: 'high' | 'medium' | 'low';
  recommendedAction: 'call' | 'email';
  preGeneratedMessage: string;
}

interface ActionCardProps {
  card: ActionCard;
}

const CARD_WIDTH = Dimensions.get('screen').width - 48;
const SCREEN_WIDTH = Dimensions.get('screen').width;

const initialActionCards: ActionCard[] = [
  {
    id: 1,
    customerName: "Example Customer",
    type: "Delayed Delivery",
    description: "Customer's recent order is delayed",
    urgency: "medium",
    recommendedAction: "email",
    preGeneratedMessage: "Dear customer, we apologize for the delay..."
  }
  // Add more cards as needed
];

const ActionCard: React.FC<ActionCardProps> = ({ card }) => (
  <Card className="rounded-2xl">
    <CardHeader>
      <View className="flex justify-between items-start">
        <View>
          <CardTitle className="text-lg">
            <Text>{card.customerName}</Text>
          </CardTitle>
          <View className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Badge variant={getBadgeColor(card.type)}>
              <Text>{card.type}</Text>
            </Badge>
          </View>
        </View>
        <Badge variant={card.urgency === 'high' ? 'destructive' : card.urgency === 'medium' ? 'default' : 'secondary'}>
          <Text>{card.urgency}</Text>
        </Badge>
      </View>
    </CardHeader>
    <CardContent className="flex-grow">
      <Text className="text-base mb-4">{card.description}</Text>
      <ScrollView style={{ height: 200, borderWidth: 1, borderRadius: 6 }}>
        <View className="p-4">
          <Text className="text-sm font-semibold mb-2">
            Recommended Action: {card.recommendedAction === 'call' ? 'Call' : 'Email'}
          </Text>
          <Text className="text-sm leading-relaxed">{card.preGeneratedMessage}</Text>
        </View>
      </ScrollView>
    </CardContent>
    <CardFooter className="flex flex-col">
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700 w-full">
            {card.recommendedAction === 'call' ? <Phone className="mr-2 h-4 w-4" /> : <Mail className="mr-2 h-4 w-4" />}
            <Text>{card.recommendedAction === 'call' ? 'Call' : 'Email'}</Text>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              <Text>{card.recommendedAction === 'call' ? 'Call Notes' : 'Send Email'}</Text>
            </DialogTitle>
            <DialogDescription>
              <Text>
                {card.recommendedAction === 'call' 
                  ? 'Record the details of your call here.' 
                  : 'Review and send the pre-generated email.'}
              </Text>
            </DialogDescription>
          </DialogHeader>
          {card.recommendedAction === 'call' ? (
            <View className="gap-4 py-4">
              <Textarea placeholder="Enter your call notes here..." />
            </View>
          ) : (
            <View className="gap-4 py-4">
              <Textarea defaultValue={card.preGeneratedMessage} />
            </View>
          )}
          <DialogFooter>
            <Button>
              <Text>{card.recommendedAction === 'call' ? 'Save Notes' : 'Send Email'}</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <View className="flex-row space-x-2 w-full mt-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="flex-1">
              <Text>Add Event</Text>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">

          </DialogContent>
        </Dialog>
        <Button size="sm" variant="outline" className="flex-1 text-rose-500 hover:bg-rose-50">
          <X className="mr-2 h-4 w-4" />
          <Text>Ignore</Text>
        </Button>
      </View>
    </CardFooter>
  </Card>
);

const getBadgeColor = (label: string): "default" | "secondary" | "destructive" | "outline" => {
  const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    'Delayed Delivery': 'secondary',
    'Churn Risk': 'destructive',
    'Purchase Potential': 'default',
    // ... add other mappings as needed
  };
  return variantMap[label] || 'default';
};

const ActionCards: React.FC = () => {
  const [actionCards, setActionCards] = useState<ActionCard[]>(initialActionCards);

  return (
    <View className="w-full max-w-sm relative h-[500px]">
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH}
        scrollEventThrottle={16}
        decelerationRate={0}
        contentContainerStyle={{ paddingHorizontal: 0 }}
        className="h-full"
      >
        {actionCards.map((card) => (
          <View key={card.id} style={{ width: CARD_WIDTH }}>
            <ActionCard card={card} />
          </View>
        ))}
      </Animated.ScrollView>
    </View>
  );
};

export default ActionCards;
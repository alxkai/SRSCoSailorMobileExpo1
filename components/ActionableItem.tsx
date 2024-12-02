import React from 'react';
import { View, Text } from 'react-native';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';

type Priority = 'High' | 'Medium' | 'Low';

interface ActionableItemProps {
  title: string;
  priority: Priority;
}

const ActionableItem: React.FC<ActionableItemProps> = ({ title, priority }) => {
  const getBadgeVariant = (priority: Priority): "default" | "secondary" | "destructive" => {
    const variantMap: Record<Priority, "default" | "secondary" | "destructive"> = {
      'High': 'destructive',
      'Medium': 'default',
      'Low': 'secondary'
    };
    return variantMap[priority];
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <View className="flex flex-row justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <Badge variant={getBadgeVariant(priority)}>
            <Text className="text-xs font-semibold text-primary-foreground">
              {priority}
            </Text>
          </Badge>
        </View>
      </CardHeader>
    </Card>
  );
};

export default ActionableItem;


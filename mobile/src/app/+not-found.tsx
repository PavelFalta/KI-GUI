import { Text, View } from 'react-native';
import { viewStyle } from '@/constants/Common';

export default function NotFoundScreen() {
  return (
    <View style={viewStyle}>
      <Text>The requested page was not found.</Text>
    </View>
  );
}

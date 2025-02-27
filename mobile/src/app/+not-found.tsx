import { Text, View } from 'react-native';
import { styles } from '@/constants/Theme';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>The requested page was not found.</Text>
    </View>
  );
}

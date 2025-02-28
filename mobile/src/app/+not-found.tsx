import { Text, View } from 'react-native';
import { styles } from '@/constants/Styles';

export default function NotFoundScreen() {
  return (
    <View style={styles.view}>
      <Text style={styles.text}>The requested page was not found.</Text>
    </View>
  );
}

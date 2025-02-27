import { Text, View } from 'react-native';
import { styles } from '@/constants/Theme';
import { GenericButton } from '@/components/Button';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <GenericButton title="Get started" href="/login" />
    </View>
  );
}

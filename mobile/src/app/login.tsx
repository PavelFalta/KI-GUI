import { Text, View } from 'react-native';
import { styles } from '@/constants/Theme';
import { GenericButton } from '@/components/Button';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <GenericButton title="Log in" href="/courses" />
    </View>
  );
}

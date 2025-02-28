import { View } from 'react-native';
import { styles } from '@/constants/Styles';
import { DocButton } from '@/components/Button';
import { navigateWithHistory } from '@/constants/Helpers';

export default function WelcomeScreen() {
  return (
    <View style={styles.view}>
      <DocButton title="Get started" onPress={() => navigateWithHistory({ route: 'login' })} />
    </View>
  );
}

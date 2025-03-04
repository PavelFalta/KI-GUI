import { View } from 'react-native';
import { classes } from '@/constants/Styles';
import { DocButton } from '@/components/DocSchool';
import { navigateWithHistory } from '@/constants/Functions';

export default function WelcomeScreen() {
  return (
    <View style={classes.page}>
      <DocButton title="Get started" onPress={() => navigateWithHistory('login')} />
    </View>
  );
}

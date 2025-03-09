import { Text, View } from 'react-native';
import { classes } from '@/constants/Styles';
import { DocButton } from '@/components/DocSchool';
import { navigate } from '@/constants/Functions';

export default function SettingsScreen() {
  return (
    <View style={classes.page}>
      <DocButton title="logout" onPress={() => navigate('login')}/>
      <DocButton title="dark mode" onPress={() => {}}/>
    </View>
  );
}

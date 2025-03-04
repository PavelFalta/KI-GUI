import { Text, View } from 'react-native';
import { classes } from '@/constants/Styles';

export default function NotFoundScreen() {
  return (
    <View style={classes.page}>
      <Text style={classes.normal}>The requested page was not found.</Text>
    </View>
  );
}

import { Text, View } from 'react-native';
import { styles } from '@/constants/Styles';

export default function CoursesScreen() {
  return (
    <View style={styles.view}>
      <Text style={styles.text}>Welcome to DocSchool. It looks like you don't have any courses assigned.<br />Ask your instructor for further information.</Text>
    </View>
  );
}

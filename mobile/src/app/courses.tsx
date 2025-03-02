import { Text, View } from 'react-native';
import { styles } from '@/constants/Styles';
import { Course } from '@/components/Course';

export default function CoursesScreen() {
  return (
    <View style={styles.view}>
      <Course title="course one" progress={80} status="in progress"/>
      <Course title="course two" progress={100} status="completed"/>
    </View>
  );
}

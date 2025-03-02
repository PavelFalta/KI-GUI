import { Text, View } from 'react-native';
import { styles } from '@/constants/Styles';
import { Course } from '@/components/Course';

export default function CoursesScreen() {
  return (
    <View style={styles.view}>
      <Course title="Introductory course" progress={0.8}/>
      <Course title="Advanced statistical methods" progress={1.0} pendingApproval/>
      <Course title="Dummy" progress={1.0}/>
    </View>
  );
}

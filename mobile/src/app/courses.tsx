import { Text, View, TouchableOpacity } from 'react-native';
import { Stack } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { DocButton, DocCourse, DocSettings } from '@/components/DocSchool';
import { classes } from '@/constants/Styles';
import { navigateWithHistory } from '@/constants/Functions';

export default function CoursesScreen() {
  function SettingsButton() {
    return (
    <TouchableOpacity onPress={() => navigateWithHistory('settings')} >
      <Ionicons name="settings-sharp" size={20} style={[classes.container, classes.normal]}/>
    </TouchableOpacity>
    );
  }

  return (
    <View style={classes.page}>
      <Stack.Screen options={{ headerRight: () => <SettingsButton />}} />
      <DocCourse title="Introductory course" progress={0.8} />
      <DocCourse title="Advanced statistical methods" progress={1.0} />
      <DocCourse title="Dummy" progress={0.2} />
    </View>
  );
}

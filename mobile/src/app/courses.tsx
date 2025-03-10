import { Text, View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { navigateWithHistory, noViewStyle, scrollViewStyle } from '@/constants/Common';

function ProgressBar({ progress }) {
	return (
    <View style={styles.progressBar}>
      <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
    </View>
	);
}

function SettingsButton() {
  return (
  <TouchableOpacity onPress={() => navigateWithHistory('settings')} >
    <Ionicons name="settings-sharp" size={20} />
  </TouchableOpacity>
  );
}

export default function CoursesScreen() {
  const handleSelectCourse = () => {
    navigateWithHistory('courseDetails');
  };

  return (
    <View style={noViewStyle}>
      <ScrollView contentContainerStyle={scrollViewStyle}>
        <Stack.Screen options={{ headerRight: () => <SettingsButton />}} />

        <TouchableOpacity onPress={handleSelectCourse} style={styles.course}>
          <Text style={styles.courseTitle}>Introduction</Text>
          <ProgressBar progress={0.8} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSelectCourse} style={styles.course}>
          <Text style={styles.courseTitle}>Homework and Activities</Text>
          <Text style={styles.statusPending}>
            Pending
          </Text>
          <ProgressBar progress={0.2} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSelectCourse} style={styles.course}>
          <Text style={styles.courseTitle}>Advanced Statistical Methods</Text>
          <Text style={styles.statusFinished}>
            Finished
          </Text>
          <ProgressBar progress={1} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  course: {
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'grey',
    paddingHorizontal: 10,
    paddingVertical: 9,
    width: '100%',
  },
  courseTitle: {
    fontSize: 16,
  },
  progressBar: {
    height: 5,
    marginTop: 15,
    backgroundColor: 'lightgrey',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'black',
    borderRadius: 5,
  },
  statusPending: {
    borderRadius: 3,
    fontSize: 10,
    position: 'absolute',
    margin: 7,
    paddingHorizontal: 2,
    paddingVertical: 1,
    top: 0,
    right: 0,
    backgroundColor: 'orange',
    color: 'white',
  },
  statusFinished: {
    borderRadius: 3,
    fontSize: 10,
    position: 'absolute',
    margin: 7,
    paddingHorizontal: 2,
    paddingVertical: 1,
    top: 0,
    right: 0,
    backgroundColor: 'green',
    color: 'white',
  },
});

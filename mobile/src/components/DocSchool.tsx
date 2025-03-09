import { TouchableOpacity, TextInput, Text, View } from 'react-native';
import { navigateWithHistory } from '@/constants/Functions';
import { classes, bar } from '@/constants/Styles';

export function DocButton({ title, onPress }) {
	return (
    <TouchableOpacity onPress={onPress} style={classes.button}>
      <Text style={[classes.container, classes.inverted, classes.bold]}>{title}</Text>
    </TouchableOpacity>
	);
}

export function DocInput({ placeholder, onChangeText, secureTextEntry = false }) {
  return (
    <TextInput
      placeholder = {placeholder}
      onChangeText={(newText) => onChangeText(newText)}
      secureTextEntry = {secureTextEntry}
      style = {[classes.container, classes.normal, classes.underline]}
    />
  );
}

export function DocProgressBar({ progress }) {
	return (
    <View style={classes.progressBarContainer}>
      <View
        style={[ classes.progressBar, { width: `${progress * 100}%` }]}
      />
    </View>
	);
}

export function DocCourse({ title, progress, pendingApproval = false, finished = false }) {
  return (
    <TouchableOpacity onPress={() => navigateWithHistory('specific-course')} style={[classes.container, classes.highlighted, classes.spread]}>
      <Text style={classes.highlightedText}>{title}</Text>
      <Text style={[classes.statusMessage, classes.normal]}>
        {pendingApproval ? 'Pending approval' : finished ? 'Finished' : ''}
      </Text>
      <DocProgressBar progress={progress} />
    </TouchableOpacity>
  );
}

export function DocCourseDetail({ sampleTasks }) {

  const currentTask = Object.keys(sampleTasks.currentTask)

  return (
    <>
    <Text>{currentTask}</Text>
    <Text>{sampleTasks.currentTask.task4}</Text>
    <DocButton title="Submit for approval" onPress={() => {}}/>
      
    <Text>Completed Tasks:</Text>
    {Object.entries(sampleTasks.completedTasks).map(([key, value]) => (
      <Text>✔ {key}: {value}</Text>
    ))}

    <Text>Unfinished Tasks:</Text>
    {Object.entries(sampleTasks.unfinishedTasks).map(([key, value]) => (
      <Text>❌ {key}: {value}</Text>
    ))}
    </>
  );
}

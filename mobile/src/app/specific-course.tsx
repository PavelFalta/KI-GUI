import { Text, View } from 'react-native';
import { classes } from '@/constants/Styles';
import { DocCourseDetail } from '@/components/DocSchool';

export default function SpecificCourseScreen() {

  const sampleTasks = {
    currentTask: {
      task4: "This is the current task",
    },
    completedTasks: {
      task1: "Sample task that has been done",
      task2: "Another task that is also done",
      task3: "Another task that is also done",
    },

    unfinishedTasks: {
      task5: "Task that is not completed yet",
      task6: "Another task that is not completed yet",
    },
  };

  return (
    <View style={classes.page}>
      <DocCourseDetail sampleTasks={ sampleTasks }/>
    </View>
  )
}

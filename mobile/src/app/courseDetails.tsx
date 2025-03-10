import { useState } from 'react';
import { Text, ScrollView, View, TouchableOpacity, StyleSheet } from 'react-native';
import { noViewStyle, scrollViewStyle } from '@/constants/Common';

const currentTask = {
  number: 4,
  content: "Put together the presentation slides for the upcoming client pitch. Make sure to highlight the key deliverables."
};

const tasks = [
  {
    number: 1,
    content: "Finish writing the project report by the end of the day. Ensure all sections are updated."
  },
  {
    number: 2,
    content: "Set up a meeting with the marketing team for next week to discuss the new campaign strategy."
  },
  {
    number: 3,
    content: "Complete the data analysis for the report. The team needs it to finalize the presentation slides."
  },
];

function TaskList({ title, tasks }) {
  return (
    <>
    <Text style={styles.listTitle}>{title}</Text>
    {tasks.map((task, index) => (
      <Text style={styles.listItem} key={task.number}>
        Task {task.number}: {task.content}
      </Text>
    ))}
    </>
  );
}

export default function CourseDetailsScreen() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  return (
    <View style={noViewStyle}>
      <ScrollView contentContainerStyle={scrollViewStyle}>
        <View style={styles.currentTask}>
          <Text style={styles.currentTaskTitle}>Task {currentTask.number}</Text>
          <Text>{currentTask.content}</Text>
          <TouchableOpacity onPress={handleSubmit} style={isSubmitted ? styles.submittedButton : styles.button}>
            <Text style={styles.buttonText}>{isSubmitted ? 'Waiting for approval...' : 'Submit for approval'}</Text>
          </TouchableOpacity>
        </View>
        <TaskList title="Tasks to be completed" tasks={tasks}/>
        <TaskList title="Completed tasks" tasks={tasks}/>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  currentTask: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'grey',
    paddingHorizontal: 10,
    paddingVertical: 9,
    width: '100%',
  },
  currentTaskTitle: {
    fontSize: 16,
    alignSelf: 'flex-start',
    textDecorationLine: 'underline',
    marginBottom: 3,
  },
  listTitle: {
    marginTop: 14,
    fontSize: 16,
    alignSelf: 'flex-start',
    textDecorationLine: 'underline',
  },
  listItem: {
    marginTop: 3,
    alignSelf: 'flex-start',
  },
  button: {
    backgroundColor: 'black',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 5,
    marginTop: 15,
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  submittedButton: {
    backgroundColor: 'lightgrey',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 5,
    marginTop: 15,
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  buttonText: {
    color: 'white',
  },
});

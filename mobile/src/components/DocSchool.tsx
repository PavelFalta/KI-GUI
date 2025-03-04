import { TouchableOpacity, TextInput, Text } from 'react-native';
import ProgressBar from 'react-native-progress/Bar';
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

export function DocCourse({ title, progress }) {
  return (
    <TouchableOpacity style={[classes.container, classes.highlighted]}>
      <Text style={classes.normal}>{title}</Text>
      <ProgressBar
        progress={progress}
        color={bar.color}
        height={bar.height}
      />
    </TouchableOpacity>
  );
}

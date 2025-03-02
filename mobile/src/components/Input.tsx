import { TextInput } from 'react-native';
import { styles } from '@/constants/Styles';

export function DocInput({ placeholder, onChangeText, secureTextEntry = false }) {
  return (
    <TextInput
      placeholder = {placeholder}
      onChangeText={(newText) => onChangeText(newText)}
      secureTextEntry = {secureTextEntry}
      style = {styles.input}
    />
  );
}

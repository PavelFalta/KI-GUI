import {Pressable, Text} from 'react-native'

export function Course({ title, progress, status }) {
  return (
    <Pressable>
      <Text>{title}</Text>
      <Text>{status}</Text>
    </Pressable>
  );
}; 
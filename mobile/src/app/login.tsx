import { useState } from 'react';
import { View } from 'react-native';
import { DocButton, DocInput } from '@/components/DocSchool';
import { navigate } from '@/constants/Functions';
import { classes } from '@/constants/Styles';

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={classes.page}>
      <DocInput
        placeholder="Username"
        onChangeText={setUsername}
      />
      <DocInput
        placeholder="Password"
        onChangeText={setPassword}
        secureTextEntry
      />
      <DocButton title="Login" onPress={() => navigate('courses')} />
    </View>
  );
}

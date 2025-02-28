import { useState } from 'react';
import { View } from 'react-native';
import { DocButton } from '@/components/Button';
import { DocInput } from '@/components/Input';
import { navigate } from '@/constants/Helpers';
import { styles } from '@/constants/Styles';

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.view}>
      <DocInput
        placeholder="Username"
        onChangeText={setUsername}
      />
      <DocInput
        placeholder="Password"
        onChangeText={setPassword}
        secureTextEntry
      />
      <DocButton title="Login" onPress={() => navigate({route: 'courses'})} />
    </View>
  );
};

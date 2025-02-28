import { useState } from 'react';
import { View } from 'react-native';
import { styles } from '@/constants/Theme';
import { SubmitButton } from '@/components/SubmitButton';
import { FormInput } from '@/components/Input';
import { router } from 'expo-router';

export default function LoginScreen() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit() {
      router.replace("courses")
  };

  return (
    <View style={styles.container}>
      <FormInput label="Username" placeholder="Enter username" value={username} onChangeText={setUsername}/>
      <FormInput label="Password" placeholder="Enter password" value={password} onChangeText={setPassword} secureTextEntry/>
      <SubmitButton title="Login" onPress={handleSubmit} />
    </View>
  );

};

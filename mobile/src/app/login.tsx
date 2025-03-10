import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { navigate, viewStyle } from '@/constants/Common';
export default function LoginScreen() { const [username, setUsername] = useState(""); const [password, setPassword] = useState("");

  return (
    <View style={viewStyle}>
      <TextInput
        placeholder = "Username"
        onChangeText={setUsername}
        style = {styles.textInput}
      />
      <TextInput
        placeholder = "Password"
        onChangeText={setPassword}
        style = {styles.textInput}
        secureTextEntry
      />
      <TouchableOpacity onPress={() => navigate('courses')} style={styles.button}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  textInput: {
    width: '100%',
    marginVertical: 5,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: 'grey',
    color: 'grey',
  },
  button: {
    backgroundColor: 'black',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 5,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
  },
});

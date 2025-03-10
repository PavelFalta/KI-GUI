import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { viewStyle, navigateWithHistory } from '@/constants/Common';

export default function WelcomeScreen() {
  const handleWelcome = () => {
    navigateWithHistory('login');
  };

  return (
    <View style={viewStyle}>
      <TouchableOpacity onPress={handleWelcome} style={styles.button}>
        <Text style={styles.buttonText}>Get started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'black',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
  },
});

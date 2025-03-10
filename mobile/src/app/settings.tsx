import { Text, View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { navigate, noViewStyle, scrollViewStyle } from '@/constants/Common';

export default function SettingsScreen() {
  const handleChangePassword = () => {
    return
  };

  const handleLogout = () => {
    navigate('');
  };

  return (
    <View style={noViewStyle}>
      <ScrollView contentContainerStyle={scrollViewStyle}>
        <TouchableOpacity onPress={handleChangePassword} style={styles.button}>
          <Text>Change password</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} style={styles.button}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    paddingVertical: 9,
  },
  logoutText: {
    color: 'red',
  },
});

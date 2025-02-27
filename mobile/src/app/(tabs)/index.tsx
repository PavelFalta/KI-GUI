import { Text, View, StyleSheet } from 'react-native';
import { Link } from 'expo-router'; 
import { styles } from '@/constants/Theme';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home screen</Text>
      <Link href="/about" style={styles.button}>
        Get 404
      </Link>
    </View>
  );
}

import { TouchableOpacity, Text } from 'react-native';
import { styles } from '@/constants/Styles';

export function DocButton({ title, onPress }) {
	return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
	);
}

import { TouchableOpacity, Text } from 'react-native';
import ProgressBar from 'react-native-progress/Bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { styles, bars } from '@/constants/Styles';

export function Course({ title, progress, pendingApproval }) {
  return (
    <TouchableOpacity style={[styles.container, styles.highlighted, styles.fixedWidth]}>
      <Text style={styles.normal}>{title}</Text>
      <ProgressBar
        progress={progress}
        indeterminate={pendingApproval}
        indeterminateAnimationDuration={bars.indeterminateAnimationDuration}
        color={bars.determineColor(progress, pendingApproval)}
        width={bars.width}
        height={bars.height}
      />
    </TouchableOpacity>
  );
}

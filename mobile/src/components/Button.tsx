import { Button } from 'react-native';
import { Link } from 'expo-router';

export function GenericButton({title, href}) {
  return (
    <Link href={href} onChild>
      <Button title={title} />
    </Link>
  );
}

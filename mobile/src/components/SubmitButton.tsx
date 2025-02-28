import {View, Button} from 'react-native';

export function SubmitButton({title, onPress}) {
    return (
        <View>
            <Button title={title} onPress={onPress}/>
        </View>
    );
};
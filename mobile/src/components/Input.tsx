import {Text, View, TextInput} from 'react-native';


export function FormInput({label, placeholder, value, onChangeText, secureTextEntry = false, keyboardType}) {
    return (
        <View>
            <Text>{label}</Text>
            <TextInput
                placeholder = {placeholder}
                value = {value}
                onChangeText={onChangeText}
                secureTextEntry = {secureTextEntry}
                keyboardType={keyboardType}
            />
        </View>
    );
};
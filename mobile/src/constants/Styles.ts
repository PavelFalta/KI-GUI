import { StyleSheet } from 'react-native';

export const colors = {
  text: '#fff',
  inactive: '#929497',
  background: '#25292e',
};

export const styles = StyleSheet.create({
  view: {
    flex: 1,
    padding: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
    // justifyContent: 'center',
  },
  text: {
    color: colors.text,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.text,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 5,
    margin: 5,
  },
  buttonText: {
    color: colors.background,
    fontWeight: 'bold',
  },
  input: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    color: colors.inactive,
    borderColor: colors.text,
    borderBottomWidth: 2,
    margin: 5,
  },
});

export const screens = {
  headerStyle: {
    color: colors.text,
    backgroundColor: colors.background,
  },
  headerTintColor: colors.text,
  headerShadowVisible: false,
};

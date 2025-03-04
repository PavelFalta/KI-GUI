import { StyleSheet } from 'react-native';

export const colors = {
  white: '#fff',
  grey: '#3a4147',
  black: '#25292e',
  blue: '#007bff',
  yellow: '#ffcc00',
  green: '#28a745',
};

export const classes = StyleSheet.create({
  page: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: colors.black,
  },
  container: {
    margin: 5,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 5,
  },
  normal: {
    color: colors.white,
    backgroundColor: colors.black,
  },
  highlighted: {
    color: colors.white,
    backgroundColor: colors.grey,
  },
  inverted: {
    color: colors.black,
    backgroundColor: colors.white,
  },
  bold: {
    fontWeight: 'bold',
  },
  underline: {
    borderColor: colors.white,
    borderBottomWidth: 2,
  },
});

export const header = {
  headerStyle: {
    color: colors.white,
    backgroundColor: colors.black,
  },
  headerTintColor: colors.white,
  headerShadowVisible: false,
};

export const bar = {
  color: colors.white,
  height: 3,
};

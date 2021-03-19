const defaultColors = {
  primaryColor: '#036d05',
  primaryTextColor: '#fff',
  backgroundColor: '#fff',
  textColor: '#000',
  alertDanger: '#D74848',
  alertSuccess: 'green',
  secondaryColor: '#fff',
  drawerBackground: '#fff',
  cardColor: '#EFF6FF',
  cardTextColor: '#014CA7',
  borderColor: '#cbdaed',
  headerColor: '#fff',
  textLight: '#000',
  selectedColor: '#cde1fa',
};
const darkColors = {
  primaryColor: '#036d05',
  primaryTextColor: '#fff',
  backgroundColor: '#000',
  textColor: '#FBFBFB',
  alertDanger: '#D74848',
  alertSuccess: 'green',
  secondaryColor: '#1C1C1C',
  drawerBackground: '#202125',
  cardColor: '#21252D',
  cardTextColor: '#3F8CFF',
  borderColor: '#999999',
  headerColor: '#191719',
  textLight: '#EDECED',
  selectedColor: '#999999',
};

const themes = {
  default: {...defaultColors},
  dark: {...darkColors},
};

export const getThemeColors = (theme = 'default', brand = '') => {
  var colors = theme === 'dark' ? darkColors : defaultColors;
  if (brand) {
    brand = JSON.parse(brand);
    colors.primaryColor = brand.bgColor;
    colors.primaryTextColor = brand.fontColor;
  }

  return colors;
};

export default themes;

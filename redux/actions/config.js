export const THEME_SET = 'THEME_SET';
export const INIT = 'INIT';
export const setTheme = (theme) => ({
  type: THEME_SET,
  payload: theme,
});
export const setInit = (result) => {
  return {
    type: INIT,
    payload: result,
  };
};
export const setProfileStatus = (result) => {
  return {
    type: 'UPDATE_STATUS',
    payload: result,
  };
};

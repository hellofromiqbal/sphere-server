export const hasSpecialCharacters = (newUsername) => {
  const regex = /[!@#$%^&*(),.?":{}|<>]/;
  return regex.test(newUsername);
};
export const setToken = (newToken) => {
  localStorage.setItem('token', newToken);
};

export const getToken = () => {
  return localStorage.getItem('token');
};

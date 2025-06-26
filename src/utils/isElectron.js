const isElectron = () => {
  return !!(typeof window !== 'undefined' && window.electronAPI);
};

export default isElectron;

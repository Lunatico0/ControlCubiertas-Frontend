export const getSuggestedCode = (tires = []) => {
  const maxCode = tires.reduce((max, tire) => tire.code > max ? tire.code : max, 0);
  return maxCode + 1;
};

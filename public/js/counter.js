
let count = 0;
const globalUsername = "Juanito";

export const increment = () => {
  console.log("Incrementando count");
  return ++count;
};

export const decrement = () => {
  console.log("Decrementando count");
  return --count;
};

export const getGlobalUsername = () => {
  return globalUsername;
};

    
/**
 *
 * @param {never} _value
 */

export const exhaustiveGuard = (_value) => {
  throw new Error(
    `Error! Reached forbidden guard function with unexpected value: ${JSON.stringify(
      _value
    )}`
  );
};

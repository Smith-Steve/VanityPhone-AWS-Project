const numberElimination = phoneNumber => {
  // We want to test as many numbers that will not yield a vanity number as possible, so we can stop the program running other code.
  // As 0 and 1 do not contain characters and can therefore not be in vanity numbers, the program will stop if the phone number
  // contains one of these.
  const errorObject = {
    'error': 'Bad Number!'
  };
  for (let i = 0; phoneNumber.phoneNumber.length > i; i++) {
    if (phoneNumber.phoneNumber[i] === '0' || phoneNumber.phoneNumber[i] === '1') {
      throw errorObject.error;
    }
  }

  if (!phoneNumber || phoneNumber.length <= 0) {
    throw errorObject.error;
  }
};

module.exports = numberElimination;

class PhoneProperties {
  constructor(number, stringNumber = null, numberArray = null, phoneNumber = null) {
    this.number = number;
    this.stringNumber = stringNumber;
    this.numberArray = numberArray;
    this.phoneNumber = phoneNumber;
  }
}

module.exports = PhoneProperties;

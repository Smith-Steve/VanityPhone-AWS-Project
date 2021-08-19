const AWS = require('aws-sdk');
const PhoneProperties = require('./lib/phoneObject');
const numberElimination = require('./lib/elimination-test');
const dictionary = require('./lib/seven-letter-words');
const regionConfiguration = { 'region': 'us-west-2' };

const numberToLetter = {
  '2': ['a', 'b', 'c'],
  '3': ['d', 'e', 'f'],
  '4': ['g', 'h', 'i'],
  '5': ['j', 'k', 'l'],
  '6': ['m', 'n', 'o'],
  '7': ['p', 'q', 'r', 's'],
  '8': ['t', 'u', 'v'],
  '9': ['w', 'x', 'y', 'z']
};

exports.handler = async(event, context, callback) => {

  const phoneNumber = event.key1;
  const phone = new PhoneProperties(phoneNumber);
  if (typeof phoneNumber !== 'string') {
    phone.stringNumber = phoneNumber.toString();
  }
  phone.numberArray = phoneNumber.toString().split('');
  phone.phoneNumber = phone.numberArray.slice(3, 10);
  numberElimination(phone);
  const letterCombinations = [];

  for (let i = 0; i < phone.phoneNumber.length; i++) {
    Object.entries(numberToLetter).forEach(([numberKey, letterArray]) => {
      if (phone.phoneNumber[i] === numberKey) {
        letterCombinations.push(letterArray);
      }
    });
  }

  const vanityNumbers = getVanityNumbers(letterCombinations, phone);
  const finalNumbers = configureItemforInsertion(vanityNumbers);

  function getVanityNumbers(letterCombinations, phoneObject) {
    const firstArray = letterCombinations[0];
    const secondArray = letterCombinations[1];
    const thirdArray = letterCombinations[2];
    const fourthArray = letterCombinations[3];
    const fifthArray = letterCombinations[4];
    const sixthArray = letterCombinations[5];
    const seventhArray = letterCombinations[6];

    const results = {
      'CallingNumber': phoneObject.number,
      'sevenDigitNumber': phoneObject.phoneNumber.join(''),
      'matches': {
        'completeMatches': [],
        'fourLetterCompleteMatches': [],
        'fourLetterPartialMatches': []
      }
    };

    let stringTest = '';
    for (let i = 0; i < firstArray.length; i++) {
      const firstLetter = firstArray[i];
      for (let j = 0; j < secondArray.length; j++) {
        const secondLetter = secondArray[j];
        for (let k = 0; k < thirdArray.length; k++) {
          const thirdLetter = thirdArray[k];
          stringTest = firstLetter + secondLetter + thirdLetter;
          const arrayOfMatches = dictionaryCheck(stringTest, dictionary);
          if (arrayOfMatches.length > 0) {
            for (let l = 0; l < fourthArray.length; l++) {
              const fourthLetter = fourthArray[l];
              const fourLetterString = stringTest + fourthLetter;
              const fourLetterMatches = dictionaryCheck(fourLetterString, arrayOfMatches);
              const fourLetterPartialMatches = dictionaryCheck(fourLetterString, dictionary, false);
              if (fourLetterMatches.length > 0) {
                for (let m = 0; m < fifthArray.length; m++) {
                  const fiveLetter = fifthArray[m];
                  const fiveLetterString = fourLetterString + fiveLetter;
                  const fiveLetterMatches = dictionaryCheck(fiveLetterString, fourLetterMatches);
                  if (fiveLetterMatches.length > 0) {
                    for (let n = 0; n < sixthArray.length; n++) {
                      const sixthLetter = sixthArray[n];
                      const sixLetterString = fiveLetterString + sixthLetter;
                      const sixLetterMatches = dictionaryCheck(sixLetterString, fiveLetterMatches);
                      if (sixLetterMatches.length > 0) {
                        for (let o = 0; o < seventhArray.length; o++) {
                          const sevenLetter = seventhArray[o];
                          const sevenLetterString = sixLetterString + sevenLetter;
                          const sevenLetterMatches = dictionaryCheck(sevenLetterString, sixLetterMatches);
                          if (sevenLetterMatches.length > 0) {
                            results.matches.completeMatches.push(sevenLetterMatches);
                          }
                        }
                      }
                    }
                  }
                }
              }
              if (fourLetterPartialMatches.length > 0) {
                const fourLetterCompleteMatches = fourLetterPartialMatches.filter(word => {
                  return word.length === 4 ? word : null;
                });
                fourLetterPartialMatches.splice(fourLetterPartialMatches.indexOf(fourLetterCompleteMatches.join('')), 1);
                if (fourLetterPartialMatches.length > 0) results.matches.fourLetterPartialMatches.push(fourLetterPartialMatches);
                if (fourLetterCompleteMatches.length > 0) results.matches.fourLetterCompleteMatches.push(fourLetterCompleteMatches);
              }
            }
          }
          stringTest = '';
        }
      }
    }
    return results;
  }

  function configureItemforInsertion(phoneObject) {
    const numberOfCompleteMatches = phoneObject.matches.completeMatches.length;
    const numberOfPartialMatches = phoneObject.matches.fourLetterCompleteMatches.length;

    if (numberOfCompleteMatches + numberOfPartialMatches > 4) {
      delete phoneObject.matches.fourLetterPartialMatches;
    }

    return phoneObject;
  }

  function dictionaryCheck(string, validWords, returnType = true) {
    let arrayOfWords;
    if (returnType) {
      arrayOfWords = validWords.filter(item => {
        return item.indexOf(string) === 0;
      });
    }
    else {
      arrayOfWords = validWords.filter(item => {
        return item.indexOf(string) > -1;
      })
    }
    return arrayOfWords;
  }

  function dynamoDbDataInsert(numberInformation) {
    const docClient = new AWS.DynamoDB.DocumentClient(regionConfiguration);
    const parameters = {
      'TableName': 'VoiceFoundryAWSDynamoDBTable',
      'Item': {
        'ID': makeid(20),
        'Resources': JSON.stringify(numberInformation)
      }
    };


    try {
      return docClient.put(parameters).promise()
    }
    catch (error) {
      console.error(error);
    }
  }

  await dynamoDbDataInsert(finalNumbers).then(() => {
    callback(null, {
      statusCode: 201,
      body: 'Successfully entered data into dynamoDb',
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }).catch((error) => {
      console.error(error)
    })
  })
  return finalNumbers;
};

function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

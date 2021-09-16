const AWS = require('aws-sdk');
const regionConfiguration = { 'region': 'us-west-2' };
const PhoneProperties = require('./lib/phoneObject');
const numberElimination = require('./lib/elimination-test');
const dictionary = require('./lib/seven-letter-words');

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

const event = {
  key1: 2156822255
}

exports.handler = async(event, context, callback) => {

  const phoneNumber = event.key1;
  // phone number is created and added to an object.
  const phone = new PhoneProperties(phoneNumber);
  if (typeof phoneNumber !== 'string') {
    phone.stringNumber = phoneNumber.toString();
  }
  phone.numberArray = phoneNumber.toString().split('');
  // turn string into array.
  phone.phoneNumber = phone.numberArray.slice(3, 10);
  // if a phone number contains a zero or a 1, an error is thrown.
  numberElimination(phone);

  // creating an array of ararys. This array will contain the arrays that contain the letters for each phone number, in the order they are in the phone number.
  const letterCombinations = [];

  // this loop right here is where that array is created and provided with the necessary information.
  for (let i = 0; i < phone.phoneNumber.length; i++) {
    Object.entries(numberToLetter).forEach(([numberKey, letterArray]) => {
      if (phone.phoneNumber[i] === numberKey) {
        letterCombinations.push(letterArray);
      }
    });
  }

  // an object containing the phone information as created by getVanityNumbers
  const vanityNumbers = getVanityNumbers(letterCombinations, phone);
  // if there are 5 matches of either 4 or 7 letters, then configureItemForInsertion removes the partial matches.
  const finalNumbers = configureItemforInsertion(vanityNumbers);

  function getVanityNumbers(letterCombinations, phoneObject) {
    const firstArray = letterCombinations[0];
    const secondArray = letterCombinations[1];
    const thirdArray = letterCombinations[2];
    const fourthArray = letterCombinations[3];
    const fifthArray = letterCombinations[4];
    const sixthArray = letterCombinations[5];
    const seventhArray = letterCombinations[6];
    //array of each sequence of alphabetical characters is created.


    //the object which will recieve the phone info.
    const results = {
      'CallingNumber': phoneObject.number,
      'sevenDigitNumber': phoneObject.phoneNumber.join(''),
      'matches': {
        'completeMatches': [],
        'fourLetterCompleteMatches': [],
        'fourLetterPartialMatches': []
      }
    };

    /*
    This series of loops determines if there are matches, and stores them. It stores 3 kinds of matches; 1, 7 letter complete matches; 2, 4 letter matches and lastly partial matches.

    It does this by creatting a single string that contains three letters. It does this through looping through each of the above arrays, and generating all possible combinations for those
    letters. So AAA, AAB, AAC, ABA, ABB, ABC etc..

    Once all the three letter combinations have been created, it is then run against a dictionary for partial matches. Please see below for more further explanation.
    */
    let stringTest = '';
    for (let i = 0; i < firstArray.length; i++) {
      const firstLetter = firstArray[i];
      for (let j = 0; j < secondArray.length; j++) {
        const secondLetter = secondArray[j];
        for (let k = 0; k < thirdArray.length; k++) {
          const thirdLetter = thirdArray[k];
          stringTest = firstLetter + secondLetter + thirdLetter;
          //Our first array of matches is created here.
          const arrayOfMatches = dictionaryCheck(stringTest, dictionary);
          // We first test to see if there are any matches.
          if (arrayOfMatches.length > 0) {
            /*
            If there are matches, a loop is then run. A new string is created consisting of 4 letters. That string, is then run against the
            three letter matches, in this case the variable is called 'arrayOfMatches'
            An array is then returned, that contains the 4 letter matches within it.
            */
            for (let l = 0; l < fourthArray.length; l++) {
              const fourthLetter = fourthArray[l];
              const fourLetterString = stringTest + fourthLetter;
              const fourLetterMatches = dictionaryCheck(fourLetterString, arrayOfMatches);
              //Here, we create an array of four letter partial matches.
              const fourLetterPartialMatches = dictionaryCheck(fourLetterString, dictionary, false);
              // We then run through that sequence again but with 5 letters.
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
                          // If there are still matches after 7 letters, then the array is added to the completeMatches property of the results object.
                          if (sevenLetterMatches.length > 0) {
                            results.matches.completeMatches.push(sevenLetterMatches);
                          }
                        }
                      }
                    }
                  }
                }
              }
              //Since there were not many 7 letter matches coming through for the phone numbers I tested. I decided to create some other matches as well.
              //For our partial mathces array (please see line 105) we run that array in a similar sort of operation that we did the sequence of dictionary checks,
              // except we looked for words that were not equal to 4 letters in the dictionary file.
              // those words are then added to their own array.
              if (fourLetterPartialMatches.length > 0) {
                const fourLetterCompleteMatches = fourLetterPartialMatches.filter(word => {
                  return word.length === 4 ? word : null;
                });
                fourLetterPartialMatches.splice(fourLetterPartialMatches.indexOf(fourLetterCompleteMatches.join('')), 1);
                //adding information to object.
                if (fourLetterPartialMatches.length > 0) results.matches.fourLetterPartialMatches.push(fourLetterPartialMatches);
                if (fourLetterCompleteMatches.length > 0) results.matches.fourLetterCompleteMatches.push(fourLetterCompleteMatches);
              }
            }
          }
          //if there are no matches, the string is cleared and another loop is run.
          stringTest = '';
        }
      }
    }
    //Our result is then returned.
    return results;
  }

  function configureItemforInsertion(phoneObject) {
    // This function determines if there are more than 4 matches: either 7 letter or 4. If there are,
    // the partial matches are then deleted so that they don't make it into the database.
    const numberOfCompleteMatches = phoneObject.matches.completeMatches.length;
    const numberOfPartialMatches = phoneObject.matches.fourLetterCompleteMatches.length;

    if (numberOfCompleteMatches + numberOfPartialMatches > 4) {
      delete phoneObject.matches.fourLetterPartialMatches;
    }

    return phoneObject;
  }

  function dictionaryCheck(string, validWords, returnType = true) {
    //This is the dicinotary function, which confirms whether or not a string that was just created, is in fact a word.
    // The third arg is entered as optional, because the majority of the time, the application runs against the arrays looking for
    // exact matches. If we need partial matches, which is a rarer case, then the optional argument can be supplied so that
    // we can get the similarly formatted data back.

    // The string argument is the current string being iterated over. That string is then run against the dictionary file, and all results are returned in a seperate array
    // and then provided to the application where it is needed.

    let arrayOfWords;
    if (returnType) {
      arrayOfWords = validWords.filter(item => {
        return item.indexOf(string) === 0;
      });
    }
    else {
      //if we want partial matches, we run this instead.
      arrayOfWords = validWords.filter(item => {
        return item.indexOf(string) > -1;
      })
    }
    return arrayOfWords;
  }

  function dynamoDbDataInsert(numberInformation) {
    // configurations for DynamoDB
    const docClient = new AWS.DynamoDB.DocumentClient(regionConfiguration);
    const parameters = {
      'TableName': 'VoiceFoundryAWSDynamoDBTable',
      'Item': {
        'ID': makeid(20),
        'PhoneNumberResults': JSON.stringify(numberInformation)
      }
    };


    try {
      // insert information into database, and then return the promise so that
      // we can know whether or not we were successful.
      return docClient.put(parameters).promise()
    }
    catch (error) {
      console.error(error);
    }
  }
  //the function that performs the insert. Please note, the code that runs
  // dynamoDb is being run in a different code block than the definition of the
  // function.




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
  // this function makes a string of characters designed to identify the entry Id.
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

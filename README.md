# AWS-Amazon-Connect-VoiceFoundry Assignment

Project to create a Lambda function that converts phone numbers and saves the 5 best resulting words from that number into Amazon's DynamoDB. Part of the assignment also was to create an amazon connect contact flow that reviews a callers phone number and provides 3 vanity possibilities that are returned.

## Assumptions

As the directions were vague, I made a couple of assumptions as I went along. These will help in understanding how the application developed

 * A match can consists of 7 letters. These are the most important matches
 * A match can consist of 4 letters.
 * The first match of any given category is the best match. All words are equal.
 * The Area code is not going to be a part of the vanity number.
 * All matches are made with English words. No other langauge is included.
 * If a 0 or 1 was in a the phone number, then that phone number was not a vanity one that would be tested for.


### Lambda

The lambda function is designed to digest a number, and determine if and how many words there are in the phone number. First it looks for seven letter words that are a complete match, and then it looks for four letter words that are a complete match. It also grabs all the partial matches. These are stored in a single object.

The manner in which it creates a match is as follows. It generates a 3 letter combination (from the first three digits of the seven digits following the area code) string, which is then run against the entire dictionary of words. It tests for a match from the beginning of the string. So if the 3 letter string is 'alb', then only words that start with 'alb' like, 'albatas' are returned.  An array of matches is then returned based off of these 3 letter matches. If there are any values in the returned array of matches, the same operation is again performed. This time however, a letter is added from the fourth digit of the phone number to the string to be tested, and the string is then run against the array of matches from the 3 letter string. This operation is continuosly performed.

The application stops to create a list of partial matches here as well.

This operation is performed sequentially all the way through the returned matches, until 7 letters are added to the final string, and then the returrned array contains a complete array of all 7 letter matches.

For the 4 letter matches, a filter operation is performed upon them to check for which matches have an length of 4. This array is then returned as the complete list of four letter matches. The variable containing the four letter matches is already there, we just need to access it again.

A variety of configurations are performed on the object containing the phone numbers. It is then put into Amazon's DynamoDB.

### Amazon Connect Contact Flow

Contact flows are designed to allow calls centers to define the interaction paths from callers.

I built out a contact flow by learning from a tutorial. I then determined how and where the user would enter their phone number, after which time in the contact flow the lambda function is invoked.


### Reasoning, Struggles & Solutions

#### Lambda

The reason I built out the lambda function this way was becuase I figured it would be simpler to dynamically check for matches against a decreasing array of words against an increasingly specific match criterion, i.e. the string. There is no absolute method to determine whether or not a string is a word independent of an outside resource. We therefore needed a dictionary. The dictionary I created for the lambda function had 30,000+ words in it. The best method to determine whether or not a phone number contained a vanity word within it, was by taking large portions out of the dictionary since. I overcame this by focusing on simplicity above other things. The solution quickly developed.

For the Lambda function I overcame a number of challenges.  I was overly specific about _how_ the results should be created, and what constituted a VanityPhone number at first, and this caused a number of issues. I spent too much time focusing on the type of match, rather than creating an application that worked smoothly and simply. I had issues with managing the phone number character arrays and their relationship to eachother. If I had been working with a client, I would have asked clarifying questions which would have removed a lot of this.


### Amazon

I was new to AWS, so I had many struggles working with Amazon Connect and the lmabda. I looked for a number of tutorials to discover how the lambda function was to be set up, and how to work through a contact flow. The tutorial really helped me establish an understanding of how the contact flow process worked, and what Amazon Connect is capable of achieving for a company. In understanding this, it was easy to see how and where a number should be extracted and the lambda could be invoked.


### Shortcuts

The way I managed the final results felt like a shortcut. The results arrays are sliced very broadly which in some cases means there will be more than 5 results returned.

I originally imporated an external diciontary, but decided creating a file would be simpler to manage. I managed to find a word confirmation library which I was able to grab the words right out of, and turn those into a searchable array easily enough.

The way I managed the arrays for the phone number within the getVanityNumbers functino was a short cut that could have been managed more elegantly.

The fact that I was close for time made it difficult to manage developing sufficient knowledge of lambda functionality and contact center to implement a solution. As a result of this, I kept trying to make it work within the way I understood, rather than following a careful procedure of asking the right questions to make sure I was headed in the right direction.


### More Time
If I had had more time, I would have proceeded more deliberately through the AWS implementation process for the lambda function.

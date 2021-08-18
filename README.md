# AWS-Amazon-Connect-VoiceFoundry Assignment

Project to create a Lambda function that converts phone numbers and saves the 5 best resulting words from that number into Amazon's DynamoDB. Part of the assignment also was to create an amazon connect contact flow that reviews a caller’s phone number and provides 3 vanity possibilities that are returned.

## Assumptions

As the directions left room for interpretation, I made a couple of assumptions as I went along. These will help in understanding how the application developed

 * A match can consist of 7 letters. These are the most important matches.
 * A match can consist of 4 letters.
 * The first match of any given category is the best match. All words are equal.
 * The area code is not going to be a part of the vanity number.
 * All matches are made with English words. No other language is included.
 * If a 0 or 1 was in the phone number, then that phone number was not a vanity number.


### Lambda

The lambda function is designed to digest a phone number, determine if there are matches and to capture them. First it looks for seven letter words that are a complete match, and then it looks for four letter words that are a complete match. It also grabs all the partial matches. These are stored in a single object.

The way it creates a match is as follows. It generates a 3-letter combination (from the first three digits of the seven digits following the area code) string, which is then run against the entire dictionary of words. It tests for a match from the beginning of the string. So, if the 3-letter string is 'alb', then only words that start with 'alb' like, 'albates' are returned.  An array of matches is then returned based off these 3 letter matches. If there are any values in the returned array of matches, the same operation is again performed. This time however, a letter is added from the fourth digit of the phone number to the string to be tested, and the string is then run against the array of matches from the 3-letter string. This operation is continuously performed.

The application stops to create a list of partial matches here as well.

This operation is performed sequentially all the way through the returned matches, until 7 letters are added to the final string, and then the returned array contains a complete array of all 7 letter matches.

A variety of configurations are performed on the object containing the phone numbers. It is then inserted into Amazon's DynamoDB at the configured location.

![4](https://user-images.githubusercontent.com/51938797/129979776-f7cbed86-12ac-4794-9df9-a920524f63aa.png)




### Amazon Connect Contact Flow

Contact flows are designed to allow calls centers to define the interaction paths from callers.

I built out a contact flow by learning from a tutorial. I then configured how and where the user would enter their phone number, after which time in the contact flow the lambda function is invoked.


![2](https://user-images.githubusercontent.com/51938797/129975129-1610fa36-9a24-4bc4-94a0-898efa3431ce.png)
![3](https://user-images.githubusercontent.com/51938797/129975145-44ec41b7-0fa0-4822-b5e6-2f0591bc4fe9.png)



### Reasoning, Struggles & Solutions

#### Lambda

I built the lambda function this way because I thought it would be simpler to dynamically check for matches against a decreasing array of words against an increasingly specific match criterion, i.e., the string.  There is no absolute method to determine whether a string is a word independent of an outside resource: we therefore needed a dictionary. The dictionary for the lambda function had 30,000+ words in it. The best method to determine whether a phone number contained a vanity word within it, was by taking large portions out of the dictionary and removing them. By continually working with a smaller and smaller sample set, it became progressively easier to determine a vanity word.

I was overly specific about _how_ the results should be created, and what constituted a VanityPhone number at first. I spent too much time focusing on the type of match, rather than creating an application that worked smoothly and simply. If I had been working with a client, I would have asked clarifying questions about the vanity number and the results they wanted to remove this.

It was new for me implementing AWS lambda functions and ensuring that I had all the configuration settings. As it was my first time working with AWS at such a level, there were lots of things I needed to get up to speed with from Amazon's documentation and YouTube tutorials. I had several issues getting the lambda function to respond to the test event, which helped to flesh out and connect my knowledge of AWS by seeing how different parts like Lambda and DynamoDB are configured to work together and respond to each other.


### Amazon

I had difficulties with Amazon connect. I looked for a number of tutorials to discover how the lambda function was to be set up, and how to work through a contact flow. The tutorial really helped me establish an understanding of how the contact flow process worked, and what Amazon Connect can achieve for a company. One of the areas I had the most difficulty with was the execution roles. I originally wrote my Lambda function outside of amazon, merely looking up what it was. If I had known I could have built one right out from the start that had all the execution roles built into it and environments built into it, the AWS implementation would have gone more smoothly.


### Shortcuts

The way I managed the results felt like a shortcut. The results arrays are sliced very broadly which in some cases means there will be more than 5 results returned. I ran out of time, so although I always provide at least 5 results, it is not nearly as neat as I would've liked.

I originally imported an external dictionary but decided creating a file would be simpler to manage. I managed to find a word confirmation library which I was able to grab the words right out of and turn those into a searchable array easily enough.

The way I managed the arrays for the phone number within the getVanityNumbers function was a short cut that could have been managed more elegantly.


### More Time

The data that was entered into the database would only contain 5 numbers, instead of the array that it does. This was something I had planned to go back and correct but did not have the time to do in the end. Instead, a number of arrays are inserted which between them contain at least 5 words.

I also would have implemented number testing for numbers with 0 and 1.

I feel that I came up with a good solution. Continually cutting the array of words down to a manageable number was a good method. I feel that there are several functions I could have written into the application that would have made it faster though. For example, I could have created a function testing for 2/3 letter sequences that do not occur next to each other in the English language. I could then have deleted some of the 3 letter strings before they're run against the dictionary file.

I would have also organized my code more clearly so it was easily understood, and I would've looked for simplications in the process as well.

I really enjoyed this project and found it challenging and rewarding, I would like to have gotten completely through the Amazon Connect contact flow though, and then have gotten it working so that it would accept real calls and return vanity strings. I wanted to confirm that my call flow was set up the correct way, and I was looking forward to seeing my number entered DynamoDB through my cell phone within the time frame. I'm going to keep working at it!

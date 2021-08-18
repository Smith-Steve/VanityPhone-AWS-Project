  
# Prompt
We expect you to build this out as you would a production project for a client, only on a small scale (tests, error handling, etc). 
Where you don't have the time to implement something, add comments to your code or documentation on how you would have changed or added to your implementation in the "real world".

Deliverables
1.           Git Repo with all code and documentation
2.           BONUS - a working Amazon Connect phone number to test in your environment :-)


Exercise
1. Create a Lambda that converts phone numbers to vanity numbers and save the best 5 resulting vanity numbers and the caller's number in a DynamoDB table. "Best" is defined as you see fit - explain your thoughts.
2. Create an Amazon Connect contact flow that looks at the caller's phone number and says the 3 vanity possibilities that come back from the Lambda function.
3. Writing and Documentation
                1. Record your reasons for implementing the solution the way you did, struggles you faced and problems you overcame.
                2. What shortcuts did you take that would be a bad practice in production?
                3. What would you have done with more time? We know you have a life. :-)

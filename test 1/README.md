# Social Media: Query Likes

## Introduction

Your task is to implement the function `SocialNetworkQueries#findPotentialLikes(minimalScore)`
per the requirements and make tests pass.

## Problem Statement

For current user `SocialNetworkQueries#findPotentialLikes(minimalScore)` should return a `Promise` which resolves with an array of book titles, which are considered as potential likes. If a book is a potential like it means there is a chance user will like such title too because it is liked by some of their friends.

The promise resolves with the following structure:

```json
[<string>]
```

### Computing potential likes

* A book is considered a potential like if it is liked by certain number of user's friends or more. That number is defined by `minimalScore` (eg. for 8 friends minimal score of `0.25` means that at least 2 out of 8 friends have to like a given book).

* A book is **not** considered a potential like if it is already liked by a user.

### Ordering of potential likes

* A book with a higher score (liked by more friends) should be placed before a book with a lower score.

* In case of same scores titles should be ordered alphabetically. **Important:** to make sure your implementation matches the one expected in tests please use `title1.localeCompare(title2, "en", { sensitivity: "base" })` to compare titles of 2 books.

### Caching

Assuming you use the same instance of `SocialNetworkQueries` for more than 1 `findPotentialLikes` call: 

* In the case of `fetchCurrentUser` resulting in a rejected promise the last known user data should be used instead for computing potential likes' ...

* … unless no successfully fetched user data exists. In such case `findPotentialLikes` should output empty likes (`[]`). 

### Not-so-happy paths

* If a user has no field required to compute potential likes, `findPotentialLikes` should resolve with empty likes (`[]`). Eg. if there is no `friends` field in a user.

* If some friend has no `likes` field, `findPotentialLikes` should ignore such friend when computing potential likes.

* If a book is listed more than once for given friend, it should be considered as a single occurrence only.
 
### Input

#### `fetchCurrentUser`

`fetchCurrentUser` is a function which returns a `Promise`,
either resolved or rejected. The resolved `Promise` contains
user data in form of:

```json
{
    likes: [<string>],
    friends: [
        { 
            id: <string>,
            likes: [<string>]
        },
    ]
}
```

The field `likes` contains titles of books liked by the current user. The fields `friends[…].likes` contain titles of books liked by each friend of the current user.      

All these fields can be null, undefined or missing:

* `likes`,
* `friends`,
* `friends[…].id`,
* `friends[…].likes`,

#### `minimalScore`

`minimalScore` is a float (type of number) between 0 and 1 used to limit computed potential likes for the current user. Score is a ratio of friends who like a book or title to number of all of a user's friends.

Examples:

* `minimalScore` of `0.5` means a given book has to be liked by at least 50% of friends to be considered as a potential like,     
* `minimalScore` of `0.1` means given book has to be liked by at least 10% of friends to be considered as a potential like,    
* `minimalScore` of `0` means all books liked by any of friends has to be considered as potential like.

### Example

Let's assume that user data returned in a resolved promise of `fetchCurrentUser` resembles the following …

```json
{
    likes: ["Moby Dick", "Crime and Punishment"],
    friends: [
        {
            id: "YazL",
            likes: ["Crime and Punishment", "Brave New World"],
        },
        {
            id: "queen9",
            likes: ["Pride and Prejudice", "Crime and Punishment"],
        },
        {
            id: "joyJoy",
            likes: ["Moby-Dick", "Pride and Prejudice"],
        },
        {
            id: "0sin5k1",
            likes: ["Pride and Prejudice", "Brave New World"],
        },
        {
            id: "mariP",
            likes: ["Moby-Dick", "Frankenstein", "Crime and Punishment"],
        }
    ],
}
``` 

… then if we perform a query with the minimal score of  `0.3` …

```js
const socialNetworkQueries = new SocialNetworkQueries({ fetchCurrentUser });
socialNetworkQueries.findPotentialLikes(0.3)
    .then(potentialLikes => {
        // …
    });
```

… returned `potentialLikes` will be

```json
[
    "Pride and Prejudice",
    "Brave New World",
    "Moby-Dick",
]
```

## Setup

Follow these steps if you are using zip/git mode (i.e. not available inside Devskiller in-browser IDE):

1. `npm install` – install dependencies
2. `npm test` – run all tests (this will be used to evaluate your solutions)
3. `npm run test:watch` – run all tests in _watch mode_ (alternative to `npm test` which you might find more convenient to use locally)
4. `nvm install` - (optional) set up the expected _major_ version of Node.js locally ([`nvm`](https://github.com/nvm-sh/nvm) required; Node.js version defined in `.nvmrc` file)

**Good Luck!**

# Scissors, Paper, Rock, Lizard, Spock (scropalisp)

> This is an extension on the classic rock, paper, scissors ("scropalisp"*) game that adds two new hands shapes (spock - vulcan greeting, and lizard - fingers together). It is a multiplayer, multi weapon game in which players can hold as many weapons as desired per game (up to 100). 

 *Yes, I know it should be "scparolisp", but "scropalisp" is pronouncable

This game is distributed and any number of participants (AI and Human) can take part in any game. Players, play hands made with any number of weapons, this allows them to distribute risk or to leverage greater returns. The desired weapons are added to a hand that is added to an open game. Once the game is closed for new hands scoring takes place and players have their scores adjusted 

## Motivation

By itself a simple game like this does not require a blockchain, but one we release this into a broad network with multiple nodes or where AI may compete in various games at the same time a blockchain facilitates in the following ways:

* Transactional updating of scores
* Incorruptible evidential record for research purposes

To determine how well an AI has done we will look at its score and the number of games played. The transactional incrementing of the scores are critical  because errors during race conditions with a massively parallel system is hard to track down

## Composition

**Participants:**

`Player`: A participant playing hands in a game

`GameMaster`: A participant creating and closing games 

**Assets:**

`Game`: Held and controlled by the `GameMaster`. `Player`s submit hands to a game transactionally. The game is also closed as scored transactionally

**Transactions:**

`PlayHand`: `Player`s use this transaction to submit their hands to a game. 

`CloseGame`: `GameMaster`s use this transaction to prevent the addition of more hands to the game and to adjust scores transactionally

The `GameMaster` will open new games for players and close the game for scoring.

The `addHand` function is called when an `PlayHand` transaction is submitted by a `Player`. The logic simply checks that the `Game` is still open for new hands, and then adds the hand to the `Game` (in the asset registry)

The `closeGame` function is called when a `CloseGame` transaction is submitted for processing. The logic checks that the `Game` is still open, scores the hands and distributes positive or negative scores to the `Players` according to their hands.

## Process 
The process starts with `GameMaster` creating a game. Each `Player` chooses the weapons for a hand and submits the hand to the game by calling `PlayHand`. Once the `GameMaster` decides to close the game (probably with limits on time, number of players), they can call `CloseGame`. The `CloseGame` transaction scores the game and awards points to players.

### Scoring each hand 
Each weapon in a hand is scored against all the other types of weapons (in all hands). The score for each weapon is a negative or positive value added to the hand's score. For instance, each Rock will get a score of AllScissors - AllPapers + AllLizards - AllSpocks.  Since a hand can hold multiple weapons, and any number of each, the score for a hand is then

```
hand.score =  hand.numScissor * (totPaper - totRock + totLizard - totSpock) +
              hand.numPaper * (totRock - totLizard + totSpock - totScissor ) +
              hand.numRock * (totScissor - totPaper + totLizard - totSpock) +
              hand.numLizard * (totPaper - totRock + totSpock -totScissor) + 
              hand.numSpock * (totScissor - totPaper + totRock - totLizard);
```

The scores in hands can be large positive or negative integers

### Awarding points to players ###

Since all weapons are scored against other weapons (including weapons in the same hand) the total score of all weapons over all hands is always 0 (the sum of positive, negative values will cancel out). 

To normalize the scores for `Player`s to a maximum of +1 and minimum of -1 per `Game` we divide each `Player`'s hand's score over the total score of positive scoring hands. `Player`s with "winning" hands will share 1 point. Players with "losing" hands will share a penalty of -1. Penalties and Points are added to the `Player`'s `score`
 
## Basic Tutorial

In the `GameMaster` participant registry, create a new participant.

```
{
  "$class": "org.acme.scropalisp.GameMaster",
  "email": "gm@email.com",
  "firstName": "Game",
  "lastName": "Master"
}
```

In the `Player` participant registry, create three participants. This will add three players,  two `HUMAN` and one `AI`

```
{
  "$class": "org.acme.scropalisp.Player",
  "playerType": "HUMAN",
  "score": 0,
  "gamesPlayed": 0,
  "email": "joe@email.com",
  "firstName": "Joe",
  "lastName": "Smith"
}
```

```
{
  "$class": "org.acme.scropalisp.Player",
  "playerType": "HUMAN",
  "score": 0,
  "gamesPlayed": 0,
  "email": "amy@email.com",
  "firstName": "Amy",
  "lastName": "White"
}
```

```
{
  "$class": "org.acme.scropalisp.Player",
  "playerType": "AI",
  "score": 0,
  "gamesPlayed": 0,
  "email": "frank@email.com",
  "firstName": "Frank",
  "lastName": "Stein"
}
```
In the `Game` asset registry, create a new game. The game is held by our one and only `GameMaster`

```
{
  "$class": "org.acme.scropalisp.Game",
  "gameID": "1",
  "state": "OPEN",
  "owner": "resource:org.acme.scropalisp.GameMaster#gm@email.com"
}

```

Each player will submit a hand to the game. We allow users to submit multiple hands to the same game if desired.

Joe is playing 5 scissors, 2 rocks and 3 lizards (hedging his bet).

You can use the `PlayHand` transaction to submit the hands and then view the hands as they are added to the `Game` asset

```
{
  "$class": "org.acme.scropalisp.PlayHand",
  "numScissor": 5,
  "numPaper": 0,
  "numRock": 2,
  "numLizard": 3,
  "numSpock": 0,
  "player": "resource:org.acme.scropalisp.Player#joe@email.com",
  "game": "resource:org.acme.scropalisp.Game#1"
}
```
Amy is splitting her bet between paper and rock (1 each)

```
{
  "$class": "org.acme.scropalisp.PlayHand",
  "numScissor": 0,
  "numPaper": 1,
  "numRock": 1,
  "numLizard": 0,
  "numSpock": 0,
  "player": "resource:org.acme.scropalisp.Player#amy@email.com",
  "game": "resource:org.acme.scropalisp.Game#1"
}

```
Frank (our AI player) is playing 100% Spock - a logical choice. If he plays many Spocks the upside still remains 1.0, and the downside -1.0. But his share of the win (or loss) would be greater

```
{
  "$class": "org.acme.scropalisp.PlayHand",
  "numScissor": 0,
  "numPaper": 0,
  "numRock": 0,
  "numLizard": 0,
  "numSpock": 1,
  "player": "resource:org.acme.scropalisp.Player#frank@email.com",
  "game": "resource:org.acme.scropalisp.Game#1"
}
```


As soon as a `Game` has been created (and is in the `OPEN` state) participants can submit `PlayHand` transactions to enter the game. You can see the hands in the game asset

To score the game submit a `CloseGame` transaction.

```
{
  "$class": "org.acme.scropalisp.CloseGame",
  "game": "resource:org.acme.scropalisp.Game#1"
}
```

This simply indicates that the `Game` with ID `1` is now done and will be scored, triggering the `closeGame` function that was described above.

Click on the `Game` asset with ID 1 in registry, look at the scores for the hands played. The scores will always add to 0 per game. The state should be `CLOSED`.


If you click on the `Player` participant registry you can check the score of each Player. Winning weapons get a total score of 1 and losing weapons a total score or -1. Points will be distributed proportionately and added to player's scores. You should see that the scores
as follows:

* `joe@email.com` : -1
* `amy@email.com` : 1/3
* `frank@emai.com` : 2/3

Going all Spock - not bad. What happens if Frank plays many Spocks? He would have shared less of the gain with Amy. For instance, with 100,000 Spocks he would have had a score of 0.999995 and Amy would only get 0.000005. He would have risked losing bigger also. Therefore we cap the number of weapons to 100.

Over time in a pure random system we should expect scores to hover around zero. If we see a positive value over many games (even small positive values, it means the AI beats random guesses)

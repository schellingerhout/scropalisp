
/**
 * Close the game from hands being submitted
 * scoring of hands and points awarded to players
 * @param {org.acme.scropalisp.CloseGame} closeGame - the closeGame transaction
 * @transaction
 */
function closeGame(closeGame) {
    var game = closeGame.game;
    if (game.state == 'CLOSED') {
        throw new Error('Game already closed');
    }
    game.state = 'CLOSED'

    var players = [];
    var hands = game.hands;
    var totScissor = 0;
    var totPaper = 0; 
    var totRock = 0;
    var totLizard = 0;
    var totSpock = 0;
 
    for (i = 0; i < hands.length; i++) {
      var hand = hands[i]; 
      if (players.indexOf(hand.player) < 0) {
        hand.player.gamesPlayed += 1; // Players may play multiple hands, but we can safely adjust gamesPlayed here because we checked for uniqueness
        players.push(hand.player); 
      }
      totScissor += hand.numScissor;
      totPaper += hand.numPaper; 
      totRock += hand.numRock;
      totLizard += hand.numLizard;
      totSpock += hand.numSpock;
    } 


    var posHandScore = 0;
    for (i = 0; i < hands.length; i++) {
      var hand = hands[i];

     
      hand.score =  hand.numScissor * (totPaper - totRock + totLizard - totSpock) +
                    hand.numPaper * (totRock - totLizard + totSpock - totScissor ) +
      				hand.numRock * (totScissor - totPaper + totLizard - totSpock) +
      				hand.numLizard * (totPaper - totRock + totSpock -totScissor) + 
      				hand.numSpock * (totScissor - totPaper + totRock - totLizard);
      
     // hand.player.score += hand.score;
      
      if (hand.score > 0) {
        posHandScore += hand.score;
      }  
      
    }
    
    //normalize players scores between 1 and -1
    if (posHandScore > 0) {
      for (i = 0; i < hands.length; i++) {
        var hand = hands[i];

        hand.player.score += ( (1.0*hand.score) / (1.0*posHandScore) );
      }
    }


    return getAssetRegistry('org.acme.scropalisp.Game')
        .then(function(gameRegistry) {
            return gameRegistry.update(game);
        })
        .then(function() {
            return getParticipantRegistry('org.acme.scropalisp.Player')
        })
        .then(function(playerRegistry) {
            // save the player
            return playerRegistry.updateAll(players);
            
        });
}

/**
 * Add a Hand to a Game
 * @param {org.acme.scropalisp.PlayHand} h - the submitHand transaction
 * @transaction
 */
function addHand(h) {
  
    if (h.game.state !== 'OPEN') {
        throw new Error('Game closed to new hands');
    }
    
    if (h.game.hands == null) {
      h.game.hands = []
    }
      
    h.game.hands.push(h);
    return getAssetRegistry('org.acme.scropalisp.Game')
        .then(function(gameRegistry) {
            return gameRegistry.update(h.game);
        });

}

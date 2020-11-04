const Game = require('./game');

let games = [];

// Join user to chat
function newGame(room) {
    const checkArr = games.filter(game => game.room === room);
    if (checkArr.length !== 0) {
      return;
    }
    const game = new Game(room); 
    games.push(game);

    return game;
}

// Get current user
function getCurrentGame(room) {
  return games.find(game => game.room === room);
}

// User leaves chat
function leaveGame(room) {
  const index = games.findIndex(game => game.room === room);

  if (index !== -1) {
    return games.splice(index, 1)[0];
  }
}

// Get room users
// function getRoomUsers(room) {
//   return users.filter(user => user.room === room);
// }

module.exports = {
  newGame,
  getCurrentGame,
  leaveGame
};

const app = require('express')();
const server = require('http').createServer(app);
const options = { /* ... */ };
const {
    userJoin,
    userLeave,
    getCurrentUser,
    getRoomUsers,
    users
} = require('./utils/users')
const {
    newGame,
    getCurrentGame,
    leaveGame
} = require('./utils/games')
const formatMessage = require('./utils/messages');
const Game = require('./game');
const io = require('socket.io')(server, options);
// const Game = require('./game');

io.on('connection', socket => {

    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        console.log(users)
        // console.log(user)
        socket.join(user.room);
    
        io.to(user.room).emit('users', {
            room: user.room,
            users: getRoomUsers(user.room)
        });

        const usersInRoom = users.filter(u => u.room === user.room);
        // console.log(usersInRoom.length)
        const canStartGame = usersInRoom.length >= 6;
        // console.log(canStartGame);
        // let didStart = false;

        io.to(user.room).emit("canStartGame", canStartGame);

        socket.on('startGame', (whatToDo) => {
            if (canStartGame && whatToDo === "start") {
                /*
                    from [] of users in a given room... (so use const usersInRoom defined above)
                    want to randomly assign a role => so use the role attribute and pick one mafia at random and one "doctor" at random
                    My idea... (pseudocode)
                    : [..., ...].length = 6
                    : const mafiaIndex = Math.floor(Math.random() * 6) => range(0, 6) or 0, 1, 2, 3, 4, 5
                    : usersInRoom[mafiaIndex].role = "mafia"
                    : we want to slice (or splice?) and create new array and store in usersWithoutMafia
                    : const doctorIndex = Math.floor(Math.random() * (n - 1)) where n = array.length
                    : for loop {
                        if i === doctorIndex {
                            usersWithoutMafia[i].role = "doctor"
                        }
                        usersWithoutMafia[i].role = "villager"
                    }
                */
    
                const lengthOfArr = usersInRoom.length;
                const mafiaIndex = Math.floor(Math.random() * lengthOfArr);
                usersInRoom[mafiaIndex].role = 'mafia';
                usersInRoom.splice(mafiaIndex, 1);
                const doctorIndex = Math.floor(Math.random() * (lengthOfArr - 1))
                for (let i = 0; i < usersInRoom.length; i++) {
                    if (i === doctorIndex) {
                        usersInRoom[i].role = "doctor"
                    } else {
                        usersInRoom[i].role = "villager"
                    }
                }
    
                const currentUser = getCurrentUser(socket.id);
                socket.emit('afterSelectionProcess', currentUser);

                // check if everyone in room has a role...
                // if true : create new instance of Game i.e. new Game(room, turn, usersInRoom);
                /*
                            while(!game.isGameOver()) {
                                socket.on() // Listen to client side emits, client =(emit<userInputs>)=> check input and if valid game.kill(person) || game.revive(person)
                                io.to().emit() // emit the updates that happened
                            }

                */

                let isEveryoneAssigned = false;
                isEveryoneAssigned = usersInRoom.every(user => user.role !== '');
                if (isEveryoneAssigned) {
                    const game = new Game(currentUser.room);

                    while(!game.isGameOver()) {
                        const cTurn = game.currentTurn;
                        /* socket.on('duringNight', ({ thing, target }) => {
                            // increments within the socket.on callback
                            if (thing === "kill") {
                                game.kill(target)
                            } else if (thing === "save") {
                                game.rescue(target)
                            }
                            if (game.currentTurn === cTurn + 1) {
                                io.to(game.room).emit(game.returnUpdatedScene);

                            }

                            socket.on('something', ({ thing, target }) => {
                            // increments within the socket.on callback
                            if (thing === "kill") {
                                game.kill(target)
                            } else if (thing === "save") {
                                game.rescue(target)
                            }
                            if (game.currentTurn === cTurn + 1) {
                                io.to(game.room).emit(game.returnUpdatedScene);

                            }
                        }) */

                    }
                }
            }
        })
        /*
            server =(emit)=> canStartGame: boolean : determines whether "start" button on client is active or not
            onClick event from client =(emit)=> whether start or do nothing
            if start didStart = true
            --- do the selection process ---
            emit to a specific user their role
            emit to everyone the "story"
            class Game {
                room
                currentTurn
                mafia
                doctor
                villagers: [villager]
                deaths: [user]
                isGameOver(): boolean
                kill(): void
                revive(): void
                vote(): void
            }

        */

        

        // Listen for chatMessage
        socket.on('chatMessage', msg => {
            const user = getCurrentUser(socket.id);
            // console.log(users)
            
            if (user) {
                console.log('weee')
                io.to(user.room).emit('message', formatMessage(user.username, msg));
            }
        });
        
        // Runs when client disconnects
        socket.on('disconnect', () => {
            const user = userLeave(socket.id);
            
            io.to(user.room).emit('users', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        });

        
        
    });


    
});

server.listen(5000, () => console.log('Listening on port 5000'));
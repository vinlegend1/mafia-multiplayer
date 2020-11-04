const { users } = require("./utils/users");

class Game {
    constructor(room, turn = 0) {
        this.room = room;
        this.currentTurn = turn;
        this.deaths = [];
        this.votes = new Map();
        this.usersArr = users.filter(user => user.room === room);
        this.doctor = this.usersArr.filter(user => user.role === "doctor");
        this.mafia = this.usersArr.filter(user => user.role === "mafia");
        this.villagers = this.usersArr.filter(user => user.role === "villager");
    }

    isGameOver() {
        if (this.deaths.length === this.usersArr.length - 1 || this.mafia.length === 0) {
            return true;
        }
        return false;
    }

    kill(person) {
        // shift to array
        let index = this.villagers.indexOf(person);
        if (index === -1) {
            if (index === -1) {
                this.deaths.unshift(this.mafia.pop())
            }
            this.deaths.unshift(this.doctor.pop());
        }
        this.deaths.unshift(this.villagers.splice(index, 1));

    }

    // not really revive but rescue from death
    rescue(person) {
        // shift array
        if (person.username === this.deaths[0].username) {
            if (person.role === 'villager') this.villagers.push(this.deaths.shift());
            else if (person.role === 'doctor') this.villagers.push(this.deaths.shift());
            else if (person.role === 'mafia') this.mafia.push(this.deaths.shift());
        }
    }

    // vote someone to die
    // no idea how to do this
    vote(personStr) {
        let sum = 0;
        this.votes.set(personStr, this.votes.get(personStr) ? this.votes.get(personStr) + 1 : 0);
        this.votes.forEach((value, key, map) => {
            sum += value;
        })

        const numOfCurrentPlayers = this.usersArr.length - this.deaths.length;

        if (sum === numOfCurrentPlayers) {
            const [key, value] = [...this.votes.entries()].reduce((a, e) => e[1] > a[1] ? e : a);
            this.kill(key);
            this.votes.clear();
            this.incrementTurn();
        }
        return personStr;

    }

    incrementTurn() {
        this.currentTurn += 1;
    }
    
    returnUpdatedScene() {
        return {
            deaths: this.deaths,
            usersArr: this.usersArr
        }
    }
}

module.exports = Game;
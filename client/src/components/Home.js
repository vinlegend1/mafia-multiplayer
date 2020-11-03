import React from 'react'

const Home = () => {
    return (
        <div className="d-flex container" style={{ flexDirection: "column" }}>
            <h1 className="display-1 text-center">Mafia</h1>

            <form action="/play" >
            <div className="form-group">
                <label htmlFor="username">Username</label>
                <input type="text" required className="form-control" name="username" placeholder="Enter a cool name" />
            </div>
            <div className="form-group">
                <label htmlFor="room">Room</label>
                <input type="text" required className="form-control" name="room" placeholder="Enter room" />
            </div>
            <button type="submit" className="btn btn-outline-info form-control">Enter</button>
            </form>

        </div>
    )
}

export default Home

import React from 'react'

const Lobby = ({ users }) => {
    return (
        <div >
            <div className="bg bg-light border border-dark rounded">
                <h6 className="display-6">Lobby</h6>
                <ul>
                    {users.map(({id, username}) => <li key={id}>{username}</li>)}
                </ul>
            </div>
        </div>
    )
}

export default Lobby

import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import qs from 'qs';
import Lobby from './Lobby';

const socket = io('http://localhost:5000');

const Play = (props) => {

    const [users, setUsers] = useState([]); 
    const [currentUser, setCurrentUser] = useState(null); 
    const [newMessage, setNewMessage] = useState("");
    const [didJoin, setDidJoin] = useState(false);
    const [canStart, setCanStart] = useState(false);
    const [didStart, setDidStart] = useState(false);
    const [didGameInit, setDidGameInit] = useState(false);
    const [room, setRoom] = useState('');
    const [messages, setMessages] = useState([]);
    const inputRef = useRef()
    const chatRef = useRef()

    useEffect(() => {
        
        // gets {username, room} object
        const obj = qs.parse(props.location.search, { ignoreQueryPrefix: true })
        console.log('we')
        if (!didJoin) {
            socket.emit('joinRoom', obj);
            setDidJoin(true)
        }
        socket.on('users', ({ users, room }) => {
            // console.log(usersInRoom)
            setRoom(room);
            setUsers(users)
        });

        socket.on('message', ({ username, text, time }) => {
            // console.log('woot')
            const message = {
                username,
                text,
                time
            }
            // console.log(messages)
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
            setMessages(prevState => [...prevState, message])
            

        });

        socket.on('canStartGame', bool => {
            setCanStart(bool);
        });

        socket.on('afterSelectionProcess', (userObj) => {
            setCurrentUser(userObj);
            setDidGameInit(true);
        })

    }, []);

    const handleChange = (e) => {
        e.preventDefault();
        setNewMessage(e.target.value);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        inputRef.current.value = '';
        inputRef.current.focus();
        socket.emit('chatMessage', newMessage)
    }

    const startGame = (e) => {
        if (!canStart || didStart) {
            return;
        }
        // console.log('wooo')
        socket.emit('startGame', "start");
        setDidStart(true);
    }

    // console.log(messages)

    return (
        <div className="row">
            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2">
                <Lobby users={users} />
            </div>
            <div className="bg d-flex flex-column col-xl-7 col-lg-7 col-md-7 col-sm-7">
                <div className="d-flex justify-content-center align-items-center">
                <h4 className="display-4 text-center bg bg-info p-4">Room: {room}</h4>
    <button className={`btn btn-${!canStart ? 'dark' : 'success'} p-4 ml-4 ${!canStart ? 'disabled' : ''}`} onClick={startGame} >{!canStart ? 'Waiting for more peps' : 'Start'}</button>
                </div>
                <div>
                    {!didStart || !didGameInit ? <h4 className="display-4 text-center">Game hasn't started</h4> : (
                        <>
                            <p>{currentUser.username}</p>
                            <p>{currentUser.role}</p>
                        </>
                    )}
                </div>
            </div>
            <div className="bg bg-info col-xl-3 col-lg-3 col-md-3 col-sm-3 p-4 d-flex flex-column justify-content-between" style={{ height: "98vh" }}>
                <div style={{ overflowY: "auto" }} ref={chatRef} >
                {messages.map(({ username, text, time }) => (
                    <div className="bg bg-dark py-2 px-3 mb-2">
                        <div className="d-flex align-items-start">
                        <p className="text-white mr-3">{username}</p>
                        <small className="text-muted">Time: {time}</small>
                        </div>
                        <p className="text-white">{text}</p>
                    </div>
                ))}
                </div>
                <form className="d-flex" onSubmit={handleSubmit}>
                        <input type="text" className="form-control" ref={inputRef} onChange={handleChange} />
                    <button className="btn btn-primary form-control-sm" type="submit">Send</button>
                </form>
            </div>
        </div>
    )
}

export default Play

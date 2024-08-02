import { useEffect, useRef, useState } from 'react'
import { Button } from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useNavigate, useParams } from 'react-router-dom';
import download from 'downloadjs';

import Recent from './Recent';

import socket from '../api/socket';

import './style.css'
import {primary} from "../theme.json"

const RecievePage = ({ setTopBarProgress }) => {
    const [ recent, setRecent ] = useState([]);
    const navigate = useNavigate();
    const { id } = useParams()
    const peer = useRef(null)
    
    useEffect( () => {
        peer.current = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun.stunprotocol.org" }
            ]
        });

        socket.emit('id:sender', id)

        function onDataChannel(evt) {
            console.log("Data channel created from remote");
            const channel = evt.channel;
            channel.send("receiver:hi");

            const receivingFile = {
                buffer : [],
                metadata : {},
            }

            channel.onmessage = evt => {
                if( evt.data === "ping") return channel.send("pong");
                if (evt.data === 'EOF'){
                    download( new Blob(receivingFile.buffer ), receivingFile.metadata.filename );
                    return ;
                }
                if( typeof evt.data === 'string'){
                    const metadata = JSON.parse( evt.data );
                    receivingFile.metadata = metadata;
                    setRecent( prev => {
                        prev.push(metadata);
                        return [...prev];
                    });
                     return ;
                }
            
                receivingFile.buffer.push(evt.data);
                setRecent( prev => {
                    return prev.map( file => {
                        if( file.id == receivingFile.metadata.id ){
                            file.status = receivingFile.buffer.length / receivingFile.metadata.total_buffer_size                        }
                        return file
                    })
                })
            }
        }

        const handleIncomingOffer = async data => {
            console.log("Ïncoming offer");
            const { from, offer } = data;
            
            await peer.current.setRemoteDescription(new RTCSessionDescription(offer));
            
            console.log(`Creating answer and accepting offer ${peer.current.signalingState}`)
            const answerOffer = await peer.current.createAnswer();
            await peer.current.setLocalDescription(new RTCSessionDescription(answerOffer));
            socket.emit('offer:accepted', { answer: answerOffer, to: from });
            
            peer.current.onicecandidate = evt => {
                if( evt.candidate ){
                    const candidate = evt.candidate
                    const to = from;
                    console.log(`Sending ice candidate to ${to}`);
                    socket.emit("send:candidate", { to, candidate })
                }
            }
        }
        
        const onReceiveIceCandidate = data => {
            console.log("Received ice candidate");
            peer.current.addIceCandidate( new RTCIceCandidate(data.candidate) )
        }
        
        socket.on('incomming:offer', handleIncomingOffer)
        socket.on('receive:candidate', onReceiveIceCandidate)
        peer.current.ondatachannel = onDataChannel ;

        return () => {
            socket.off('incomming:offer', handleIncomingOffer);
            socket.off('receive:candidate', onReceiveIceCandidate)
            peer.current.ondatachannel = null ;
            peer.current.close();
        };
        
    },[])

    useEffect( () => {
        setTopBarProgress(40)
        const timer = setTimeout(() => {
            setTopBarProgress(100)
        }, 500)
        return () => {
            clearTimeout( timer )
        }
    },[setTopBarProgress])

    const disconnect = () => {
        if( peer ) peer.current.close()
        navigate("/")
    }

    return (
        <div className="Recieve">   
            <div className="button-container">
                <Button onClick={ disconnect } sx={{ color : primary, borderColor:primary}} variant="outlined" startIcon={<ExitToAppIcon />}>
                    EXIT
                </Button>
            </div>
            
            <Recent recent={recent} />
        </div>
    )
}

export default RecievePage
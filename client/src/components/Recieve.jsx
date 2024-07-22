import { useEffect, useRef, useState } from 'react'
import { Button } from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useNavigate, useParams } from 'react-router-dom';
import download from 'downloadjs';

import Recent from './Recent';

import socket from '../api/socket';
import peer from '../api/peer';

import './style.css'

const RecievePage = ({ setTopBarProgress }) => {
    const [ recent, setRecent ] = useState([]);
    const navigate = useNavigate();
    const { id } = useParams()

    useEffect( () => {
        socket.emit('id:sender', id)

        function onDataChannel(evt) {
            console.log("Data channel created from remote");
            const channel = evt.channel;

            const receivingFile = {
                buffer : [],
                metadata : {},
            }

            channel.onmessage = evt => {
                if (evt.data === 'EOF'){
                    download( new Blob(receivingFile.buffer ), receivingFile.metadata.filename );
                    return ;
                }
                if( typeof evt.data === 'string'){
                    console.log(JSON.parse( evt.data ));
                     receivingFile.metadata = JSON.parse( evt.data );
                     return ;
                }
            
                receivingFile.buffer.push(evt.data);
            }
        }

        const handleIncomingOffer = async data => {
            console.log("Ïncoming offer");
            const { from, offer } = data;
            await peer.setRemoteDescription(new RTCSessionDescription(offer));
            
            console.log(`Creating answer and accepting offer ${peer.signalingState}`)
            const answereOffer = await peer.createAnswer();
            await peer.setLocalDescription(new RTCSessionDescription(answereOffer));
            socket.emit('offer:accepted', { answere: answereOffer, to: from });
            
        }
        
        
        socket.on('incomming:offer', handleIncomingOffer)
        peer.addEventListener('datachannel', onDataChannel);

        return () => {
            socket.off('incomming:offer', handleIncomingOffer);
            peer.removeEventListener('datachannel', onDataChannel);
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

    return (
        <div className="Recieve">   

            <Button onClick={ () => navigate("/") } variant="outlined" startIcon={<ExitToAppIcon />}>
                Disconnect { id }
            </Button>
            
            <Recent recent={recent} />

        </div>
    )
}

export default RecievePage
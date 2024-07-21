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
        createOffer( id ) ;

        function onDataChannel(evt) {
            console.log("Data channel created from remote");
            const channel = evt.channel;
            channel.send("receiving");

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
        
        const handleIncomingAnswer = async data => {
            const { offer } = data;
            console.log("Answer received");
            await peer.setRemoteDescription(new RTCSessionDescription(offer));
        }

        socket.on('incomming:answer', handleIncomingAnswer );
        peer.addEventListener('datachannel', onDataChannel);

        return () => {
            socket.off('incomming:answer', handleIncomingAnswer );
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

    const createOffer = async to => {
        console.log(`Creating offer ${peer.signalingState}`);
        const localOffer = await peer.createOffer();
        await peer.setLocalDescription(new RTCSessionDescription(localOffer));
        socket.emit('outgoing:offer', { fromOffer: localOffer, to })
    }

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
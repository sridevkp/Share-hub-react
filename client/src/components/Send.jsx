import { useEffect, useRef, useState } from 'react';
import QRCode from "react-qr-code";

import { Input, InputAdornment, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import { FileUploader } from 'react-drag-drop-files'
import { nanoid } from 'nanoid';
import Recent from './Recent';

import socket from '../api/socket';

import './style.css'
import {background, text, accent, primary, secondary} from "../theme.json"

const CHUNK_SIZE = 16 * 1024 ;
const MAX_BUFFER_AMOUNT = 64 * 1024;

const SendPage = ({ setTopBarProgress }) => {
    const [ id, setId ] = useState("");
    const [ recent, setRecent ] = useState([]);
    const [ reciever, setReceiver] = useState() ;
    const peer = useRef(null)

    useEffect( () => {
        peer.current = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun.stunprotocol.org" }
            ]
        });

        socket.emit("id:self", id => setId( id )) 

        socket.on('id:receiver', receiverid => {
            console.log("Id received from receiver")
            peer.current.onicecandidate = evt => {
                if( evt.candidate ){
                    const candidate = evt.candidate
                    const to = receiverid;
                    console.log(`Sending ice candidate to ${to}`);
                    socket.emit("send:candidate", { to, candidate })
                }
            }
            const channel = peer.current.createDataChannel( "HI" );
            channel.onopen = () => {
                channel.send("ping");
                channel.onmessage = evt => {
                    console.log( evt.data )
                }
            }
            console.log("Creating channel")
            createOffer( receiverid ) 
        });

        const handleIncomingAnswer = async data => {
            const { offer } = data;
            console.log("Answer received");
            await peer.current.setRemoteDescription(new RTCSessionDescription(offer));
            setReceiver( offer );
        }

        const onReceiveIceCandidate = data => {
            console.log("Received ice candidate");
            peer.current.addIceCandidate( new RTCIceCandidate(data.candidate) );
        }

        socket.on('incomming:answer', handleIncomingAnswer );
        socket.on('receive:candidate', onReceiveIceCandidate);
        
        return () => {
            socket.off('incomming:answer', handleIncomingAnswer );
            socket.off('receive:candidate', onReceiveIceCandidate);
            peer.current.close()
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
        try{
            console.log(`Creating offer ${peer.current.signalingState}`);
            const localOffer = await peer.current.createOffer();
            await peer.current.setLocalDescription(new RTCSessionDescription(localOffer));
            socket.emit('outgoing:offer', { fromOffer: localOffer, to })
        }catch(e){
            console.log("Couldn't create offer")
        }
    }

    function readAndSendFileChunks({ file, metadata }){
        console.log("Channel created");
        const channel = peer.current.createDataChannel( file.name );
        channel.onopen = () => {
            console.log("Channel opened");
            channel.send( JSON.stringify(metadata) );
            setRecent( prev => {
                    prev.push(metadata);
                    return prev;
                } );
            readSlice(0);
        } ;

        const fileReader = new FileReader();
        let offset = 0;

        fileReader.onload = async (event) => {
            console.log("chunk loaded")
            const chunk = event.target.result;
            channel.send(chunk);
            offset += chunk.byteLength;

            const progress = offset / file.size ;
            setRecent( recent => {
                recent = recent.map( recentFile => {
                    if(recentFile.id == file.id) recentFile.progress = progress ;
                    return recentFile ;
                })
                return recent
            } );

            await flowControl();

            if (offset < metadata.total_buffer_size) {
                readSlice(offset);
            } else {
                console.log('File sent successfully');
                channel.send('EOF'); 
                channel.close();
            }
        };

        fileReader.onerror = (error) => {
            console.error('Error reading file:', error);
        };

        const readSlice = start => {
            const slice = file.slice(start, start + CHUNK_SIZE);
            fileReader.readAsArrayBuffer(slice);
        };

        const flowControl = async () => {
            while (channel.bufferedAmount > MAX_BUFFER_AMOUNT) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            }
        };
    }

    const handleChange = async file  => {
        const id = nanoid();

        const fileshare = {
            metadata : {
                id,
                filename : file.name,
                total_buffer_size : file.size,
                progress:0,
            },
            file ,
        }
        console.log("File selected")
        readAndSendFileChunks( fileshare );
    }

    const copy = () => {
        navigator.clipboard.writeText( id )
    }

    return (
        
        <div className="Send">
            <div className='id'>
                <Input
                    id="id"
                    type="text"
                    value={id}
                    readOnly
                    sx={{ color: text, path : { fill : text } }}
                    endAdornment={
                    <InputAdornment position="end">
                        <IconButton onClick={copy}>
                            <ContentCopyIcon />
                        </IconButton>
                    </InputAdornment>
                    }
                />
                <div className="qr-code-container">
                    <QRCode 
                        className='qr-code' 
                        fgColor= {text}
                        bgColor= {background}
                        size={128} 
                        value={`${location.origin}/recieve/${id}`} 
                    />
                </div>

            </div>

             <FileUploader 
                handleChange={handleChange} 
                name="file" 
                classes="file-uploader"
            />
            <Recent recent={recent}/>
            
        </div>
    )
}

export default SendPage
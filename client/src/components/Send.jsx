import { useEffect, useRef, useState } from 'react';

import { Input, InputAdornment, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import { FileUploader } from 'react-drag-drop-files'
import { nanoid } from 'nanoid';
import Recent from './Recent';

import socket from '../api/socket';
import peer from '../api/peer';

import './style.css'

const CHUNK_SIZE = 16 * 1024 ;
const MAX_BUFFER_AMOUNT = 64 * 1024;

const SendPage = ({ setTopBarProgress }) => {
    const [ id, setId ] = useState("");
    const [ recent, setRecent ] = useState([]);
    const reciever = true ;

    useEffect( () => {
        socket.emit("get:id", id => {
            setId( id );
        }) 

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
        return () => {
            socket.off('incomming:offer', handleIncomingOffer);
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

    function readAndSendFileChunks({ file, metadata }){
        const channel = peer.createDataChannel( file.name );
        console.log("Channel created",channel);
        channel.onopen = () => {
            console.log("Channel öpened");
            setRecent( recent => [ metadata, ...recent ] );
            channel.send( JSON.stringify(metadata) );
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
                    endAdornment={
                    <InputAdornment position="end">
                        <IconButton onClick={copy}>
                            <ContentCopyIcon />
                        </IconButton>
                    </InputAdornment>
                    }
                />

            </div>

             <FileUploader 
                disabled={reciever==null} 
                handleChange={handleChange} 
                name="file" 
                classes="fileuploader"
                children={
                    reciever==null&&
                    <p className='warning'>Waiting for reciever...</p>
                    
                }/>
            <Recent recent={recent}/>
            
        </div>
    )
}

export default SendPage
import { FileUploader } from 'react-drag-drop-files'
import './style.css'
import { Input, InputAdornment, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useEffect, useState } from 'react';
import Recent from './Recent';
import io from "socket.io-client"
import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';

const socket = io("http://localhost:8080")

const SendPage = ({ setTopBarProgress }) => {
    const [id,setId] = useState("")
    const [recent,setRecent] = useState([])
    const reciever = true

    useEffect( () => {
        const nid = uuidv4().split("-")[0]
        socket.emit("join-room", nid )
        setId( nid )
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

    const handleChange = ( file ) => {
        const reader = new FileReader()
        reader.readAsArrayBuffer( file )

        reader.onload = result => {
            const buffer = new Uint8Array( reader.result )
            const fileshare = {
                buffer ,
                metadata : {
                    filename : file.name,
                    buffer_size : 1024,
                    total_buffer_size : buffer.length
                },
                id : nanoid(),
                progress : 0
            }
            shareFile( fileshare )
        }

    }

    const setProgress = ( progress, id ) => {
        setRecent( recent => recent.map( file => {
            if (file.id === id ){
                file.progress = progress
            }
            return file
        }))
    }
    const shareFile = ( file ) => {
        socket.emit( "file-meta", file.metadata, id)
        setRecent( recent => [...recent, file ])

        socket.on("file-share", () => {
            const chunk = file.buffer.slice( 0, file.metadata.buffer_size )
            file.buffer = file.buffer.slice( file.metadata.buffer_size, file.buffer.length )
            setProgress(( file.metadata.total_buffer_size - file.buffer.length ) / file.metadata.total_buffer_size * 100, file.id)
            if( chunk.length > 0 ) socket.emit("file-raw", chunk, id )
        })
            
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
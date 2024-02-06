import { useEffect, useState } from 'react'
import './style.css'
import Recent from './Recent'
import { Button } from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useNavigate, useParams } from 'react-router-dom';
import io from "socket.io-client"
import { nanoid } from 'nanoid';
import download from 'downloadjs';

const socket = io("http://localhost:8080")

const RecievePage = ({ setTopBarProgress }) => {
    const [ recent, setRecent ] = useState([])
    const navigate = useNavigate()

    const {id} = useParams()

    const setProgress = ( progress, id ) => {
        setRecent( recent => recent.map( file => {
            if (file.id === id ){
                file.progress = progress
            }
            return file
        }))
    }

    useEffect( () => {

        socket.emit( "join-room", id )

        socket.on("file-meta", metadata => {
            const file = {}
            var transmitted = 0
            file.metadata = metadata
            file.buffer = []
            file.id = nanoid()

            setRecent( recent => [ ...recent, file ])
            

            socket.emit("file-share", {}, id )

            socket.on("file-raw", buffer => {
                file.buffer.push( buffer )
                transmitted += buffer.byteLength
                setProgress( transmitted / file.metadata.total_buffer_size * 100, file.id )
                
                if( transmitted === metadata.total_buffer_size ){
                    download( new Blob(file.buffer), file.metadata.filename )
                }else{
                    socket.emit("file-share", {}, id)
                }
            })

        })
        
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

    const exitRoom = () =>{
        socket.emit("exit-room",id)
        navigate("/")
    }

    return (
        <div className="Recieve">   

            <Button onClick={exitRoom} variant="outlined" startIcon={<ExitToAppIcon />}>
                Exit { id }
            </Button>
            
            <Recent recent={recent} />

        </div>
    )
}

export default RecievePage
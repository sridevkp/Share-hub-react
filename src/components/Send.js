import { FileUploader } from 'react-drag-drop-files'
import './style.css'
import Input from '@mui/material/Input';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import InputAdornment from '@mui/material/InputAdornment';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IconButton from '@mui/material/IconButton';
import HistoryIcon from '@mui/icons-material/History';

const SendPage = () => {
    const reciever = null
    const handleChange = () => {
        console.log("change")

    }

    const copy = () => {
        console.log("copy")
    }

    return (
        
        <div className="Send">
            <div className='id'>
                <Input
                    id="id"
                    type="text"
                    value={"123-456"}
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
                    <p className='warning'>Waiting for sender...</p>
                    
                }/>

            <div className='recent'>
                
            </div>
        </div>
    )
}

export default SendPage
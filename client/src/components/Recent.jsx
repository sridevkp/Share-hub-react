import HistoryIcon from '@mui/icons-material/History';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import File from './File';

import { accent } from "../theme.json"
import './style.css'

const Recent = ({ recent }) => {
    
    return (
        <div className='recent'>
            <Divider sx={{ ":after,:before":{borderColor : accent}, path:{ fill : accent }, marginTop:"24px", width:"100%" }}>
                <Chip icon={<HistoryIcon />} sx={{ color: accent, borderColor : accent }} label="Recent" variant="outlined" />
            </Divider>

            <table className='container'>
                <thead>
                    <tr>
                        <th></th>
                        <th>File name</th>
                        <th>Size</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                {
                    recent.length > 0
                    ?recent.map( (file, sl ) => {
                        return <File key={file.id} sl={sl+1} name={ file.filename } size={file.total_buffer_size} progress={file.progress} />
                    })
                    :<tr>
                        <td></td>
                        No files yet...
                    </tr>
                }
                </tbody>
            </table>

        </div>   
                
    )
}

export default Recent
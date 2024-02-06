import HistoryIcon from '@mui/icons-material/History';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import File from './File';

const Recent = ({ recent }) => {
    console.log( recent )
    return (
        <div className='recent'>
            <Divider>
                <Chip icon={<HistoryIcon />} label="Recent" variant="outlined" />
            </Divider>

            <div className='container'>
                {
                    recent.map( file => {
                        return <File key={file.id} name={ file.metadata.filename } progress={file.progress} />
                    })
                }
            </div>

        </div>   
                
    )
}

export default Recent
import HistoryIcon from '@mui/icons-material/History';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import File from './File';

const Recent = ({ recent }) => {
    return (
        <div className='recent'>
            <Divider>
                <Chip icon={<HistoryIcon />} label="Recent" variant="outlined" />
            </Divider>

            <table className='container'>
                <thead>
                    <tr>
                        <th>Idx</th>
                        <th>File name</th>
                        <th>Size</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                {
                    recent.map( (file, sl ) => {
                        return <File key={file.id} sl={sl+1} name={ file.filename } size={file.total_buffer_size} progress={file.progress} />
                    })
                }
                </tbody>
            </table>

        </div>   
                
    )
}

export default Recent
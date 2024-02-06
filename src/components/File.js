import CircularProgress from '@mui/material/CircularProgress';
import './style.css'

const File = ({ name, progress }) => {

    return (
        <div className="file">
            <p>{name}</p>
            <CircularProgress variant="determinate" value={progress} />
        </div>
    )
}

export default File
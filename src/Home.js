import { Link } from 'react-router-dom';
import './Home.css';
import { Fab, Tooltip } from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import UploadIcon from '@mui/icons-material/Upload';
// import { Button, Dialog, DialogTitle, DialogActions, DialogContent, TextField} from '@mui/material';

function Home({ setTopBarProgress }) {
  return (
    <div className="Home">
      <div className='floating'>

        <Tooltip title="Send File">
          <Link to="send">
            <Fab color='primary' size='large' >
              <UploadIcon/>
            </Fab>
          </Link>
        </Tooltip>
        
        <Tooltip title="Recieve File">
          <Link to="recieve" >
            <Fab color='primary' size='large'>
              <GetAppIcon/>
            </Fab>
          </Link>
        </Tooltip>

      </div>
      
    </div>
  );
}

export default Home;

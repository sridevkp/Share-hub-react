import { Link } from 'react-router-dom';
import { Fab, Tooltip } from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import UploadIcon from '@mui/icons-material/Upload';
import { Button, Dialog, DialogTitle, DialogActions, DialogContent, TextField} from '@mui/material';
import { useState } from 'react';

function Home({ setTopBarProgress }) {
  const [ id, setId ] = useState("")
  const [ open, setOpen ] = useState(false)
  const URL = "/recieve/"

  return (
    <div className="home">
      <div className='floating'>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
        >
          <DialogTitle>Enter Sender Id</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="id"
              fullWidth
              variant="standard"
              onChange={ e => setId( e.target.value )}
            />
          </DialogContent>
          <DialogActions>
            <Link to={URL+id}><Button>Recieve</Button></Link>
          </DialogActions>
        </Dialog>
      
        <Tooltip title="Send File">
          <Link to="send">
            <Fab color='primary' size='large' >
              <UploadIcon/>
            </Fab>
          </Link>
        </Tooltip>
        
        <Tooltip title="Recieve File">
            <Fab color='primary' size='large' onClick={ () => setOpen(true) }>
              <GetAppIcon/>
            </Fab>
        </Tooltip>

      </div>
      
    </div>
  );
}

export default Home;

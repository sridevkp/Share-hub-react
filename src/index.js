import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import SendPage from './components/Send';
import LoadingBar from 'react-top-loading-bar'
import RecievePage from './components/Recieve';
import './index.css'


function App(){
  const [ progress, setTopBarProgress ] = useState(0)
  return(
    <>
       <LoadingBar
         color='blue'
         height={3}
         progress={progress}
       />
       <Routes>

         <Route exact path="/" element={ <Home setTopBarProgress={setTopBarProgress}/>} />

         <Route exact path='/send' element={<SendPage setTopBarProgress={setTopBarProgress}/>} />

         <Route exact path='/recieve/:id' element={<RecievePage setTopBarProgress={setTopBarProgress}/>} />

       </Routes>       
    </>
    
  )
}



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App/>
  </BrowserRouter>
);


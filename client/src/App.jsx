import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import SendPage from './components/Send';
import LoadingBar from 'react-top-loading-bar'
import RecievePage from './components/Recieve';

function App() {
  const [ progress, setTopBarProgress ] = useState(0)

  return (
    <BrowserRouter>
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
    </BrowserRouter>
  )
}

export default App

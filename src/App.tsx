import React from 'react';
import './App.css'
import Clock from "./Clock";

function App() {

  return (
      <>
          <div className='app__wrapper'>
              <Clock title='Amsterdam' url='Europe/Amsterdam'/>
              <Clock title='Los Angeles' url='America/Los_Angeles'/>
              <Clock title='Bissau' url='Africa/Bissau'/>
              <Clock title='Macao' url='Asia/Macao'/>
              <Clock title='Moscow' url='Europe/Moscow'/>
          </div>
      </>
  );
}

export default App;

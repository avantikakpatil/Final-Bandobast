import React, { useState } from 'react';
import './Login.css'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useHistory } from 'react-router-dom';
import { database } from '../config/firebaseConfig';

export const Login = () => {
  const [login, setLogin] = useState(false);
  const history = useHistory();

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    if (login) {
      signInWithEmailAndPassword(database, email, password)
        .then(data => {
          console.log(data, "authData");
          history.push("/Dashboard");
        })
        .catch(err => {
          alert(err.code);
        });
    } else {
      createUserWithEmailAndPassword(database, email, password)
        .then(data => {
          console.log(data, "authData");
          history.push("/Dashboard");
        })
        .catch(err => {
          alert(err.code);
          setLogin(true);
        });
    }
  };

  return (
    <div className='app'>
      <div className='row'>
        <div className={login === false ? 'activeColor' : 'pointer'} onClick={() => setLogin(false)}>SignUp</div>
        <div className={login === true ? 'activeColor' : 'pointer'} onClick={() => setLogin(true)}>SignIn</div>
      </div>
      <h1>{login ? 'SignIn' : 'SignUp'}</h1>
      <form onSubmit={(e) => handleSubmit(e)}>
        <input name='email' placeholder='Email' /> <br />
        <input name='password' type="password" placeholder='Password' /><br /><br />
        <button>{login ? 'SignIn' : 'SignUp'}</button>
      </form>
    </div>
  );
};

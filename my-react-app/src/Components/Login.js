import React, { useState } from 'react';
import './Login.css'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useHistory } from 'react-router-dom';
import { database } from '../config/firebaseConfig';

export const Login = () => {
  const [login, setLogin] = useState(false);
  const [role, setRole] = useState('admin'); // Initialize the role state
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
        <input name='email' placeholder='Email' className='input_box' /> <br />
        <input name='password' type="password" placeholder='Password'className='input_box' /><br /><br />
        <button>{login ? 'SignIn' : 'SignUp'}</button>
        <br />
        <br />
        <div className='second_row'>
        <div className='role-selection'>
          <input type="radio" id="admin" name="role" value="admin" checked={role === 'admin'} onChange={() => setRole('admin')} />
          <label htmlFor="admin">Admin</label>
          <input type="radio" id="supervisor" name="role" value="supervisor" checked={role === 'supervisor'} onChange={() => setRole('supervisor')} />
          <label htmlFor="supervisor">Supervisor</label>
        </div>
        </div>
      </form>
    </div>
  );
};

import React from 'react'
import { useState } from 'react'
import axios from 'axios'

export default function Register() {

    const [form, setForm] = useState({name: '', email: '', password: ''});

    const submit = async(e) => {
        e.preventDefault();
        await axios.post("http://localhost:5000/api/restaurants/register", form);
        alert("Submitted !");
    }
  return (
    <div>
      <form onSubmit={submit}>
        <input type="text" placeholder='Name..' onChange={e => setForm({...form, name: e.target.value})}/>
        <input type="email" placeholder='Email..' onChange={e => setForm({...form, email: e.tartget.value})} />
        <input type="password" placeholder='Password..' onChange={e => setForm({...form, password: e.target.value})} />
        <button type='submit'>Register</button>
      </form>
    </div>
  )
}

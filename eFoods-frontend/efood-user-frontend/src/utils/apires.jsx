import axios from 'axios';

const APIres = axios.create({
  baseURL: 'http://localhost:5000/api', // Replace with your backend URL
  withCredentials: true, // Send cookies (sessions)
});

export default APIres;

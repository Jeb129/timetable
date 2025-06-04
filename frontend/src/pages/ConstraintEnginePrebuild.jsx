// src/pages/InitializeTimeSlotsPage.jsx
import axios from 'axios';

function PrebuildConstraints() {
    const token = localStorage.getItem('accessToken');
    const prebuild = () =>{
        axios.post('http://localhost:8000/api/prebuildconstraints/',{ headers: { 'Authorization': `Bearer ${token}` } })
    }
    return (
        <div className='page-container'>
        <button onClick={() => prebuild()}>кнопка</button>
        </div>
    );
}

export default PrebuildConstraints;
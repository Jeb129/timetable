// src/pages/InitializeTimeSlotsPage.jsx
import axios from 'axios';

function PrebuildConstraints() {
    const token = localStorage.getItem('accessToken');
    const prebuild = async() =>{
        const req = await axios.post('http://localhost:8000/api/prebuildconstraints/',null,{ headers: { 'Authorization': `Bearer ${token}` } });
    }
    return (
        <div className='page-container'>
        <button onClick={() => prebuild()}>кнопка</button>
        </div>
    );
}

export default PrebuildConstraints;
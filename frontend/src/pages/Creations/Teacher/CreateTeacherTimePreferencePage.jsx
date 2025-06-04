import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navigation from '../../../components/navigation/navigation';
import { useNavigate } from 'react-router-dom';
import '../../Pages.css';
import '../../../assets/form.css';

function CreateTeacherTimePreferencePage() {
    const [teacherId, setTeacherId] = useState('');
    const [slotId, setSlotId] = useState('');
    const [teachers, setTeachers] = useState([]);
    const [slots, setSlots] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('accessToken');
            const headers = { 'Authorization': `Bearer ${token}` };
            try {
                const [tRes, sRes] = await Promise.all([
                    axios.get('http://localhost:8000/api/list/teacher/', { headers }),
                    axios.get('http://localhost:8000/api/list/timeslot/', { headers })
                ]);
                setTeachers(tRes.data);
                setSlots(sRes.data);
            } catch (err) {
                console.error("Ошибка загрузки:", err);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!teacherId || !slotId) {
            setError('Все поля обязательны.');
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            await axios.post('http://localhost:8000/api/create/teachertimepreference/', {
                teacher: parseInt(teacherId),
                excluded_slot: parseInt(slotId)
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setSuccess('Предпочтение по времени успешно добавлено.');
            setTeacherId('');
            setSlotId('');
        } catch (err) {
            setError('Ошибка при создании предпочтения.');
            console.error(err);
        }
    };

    return (
        <div className="page-container">
            <Navigation links={[['/admin/create-teacher-time', 'Предпочтение времени']]} />
            <div className="form-container">
                <div className="form-header">
                    <h2>Предпочтение времени преподавателя</h2>
                    <button onClick={() => navigate(-1)} className="form-back-button">← Назад</button>
                </div>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-input-group">
                        <label>Преподаватель:</label>
                        <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} required>
                            <option value="">-- Выберите --</option>
                            {teachers.map(t => (
                                <option key={t.id} value={t.id}>{t.full_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-input-group">
                        <label>Временной слот:</label>
                        <select value={slotId} onChange={(e) => setSlotId(e.target.value)} required>
                            <option value="">-- Выберите --</option>
                            {slots.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.weekday_name} {s.is_even_week ? '(чет)' : '(нечет)'} — {s.pair_label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="form-submit-button">Сохранить</button>
                </form>
            </div>
        </div>
    );
}

export default CreateTeacherTimePreferencePage;

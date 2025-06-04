import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navigation from '../../../components/navigation/navigation';
import { useNavigate } from 'react-router-dom';
import '../../Pages.css';
import '../../../assets/form.css';

function CreateTeacherRoomPreferencePage() {
    const [teacherId, setTeacherId] = useState('');
    const [disciplineId, setDisciplineId] = useState('');
    const [lessonTypeId, setLessonTypeId] = useState('');
    const [roomId, setRoomId] = useState('');

    const [teachers, setTeachers] = useState([]);
    const [disciplines, setDisciplines] = useState([]);
    const [lessonTypes, setLessonTypes] = useState([]);
    const [rooms, setRooms] = useState([]);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const headers = { 'Authorization': `Bearer ${token}` };

        const fetchAll = async () => {
            try {
                const [tRes, dRes, lRes, rRes] = await Promise.all([
                    axios.get('http://localhost:8000/api/list/teacher/', { headers }),
                    axios.get('http://localhost:8000/api/list/discipline/', { headers }),
                    axios.get('http://localhost:8000/api/list/lessontype/', { headers }),
                    axios.get('http://localhost:8000/api/list/room/', { headers }),
                ]);
                setTeachers(tRes.data);
                setDisciplines(dRes.data);
                setLessonTypes(lRes.data);
                setRooms(rRes.data);
            } catch (err) {
                console.error("Ошибка загрузки данных:", err);
            }
        };
        fetchAll();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!teacherId || !disciplineId || !lessonTypeId || !roomId) {
            setError('Все поля обязательны.');
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            await axios.post('http://localhost:8000/api/create/teacherroompreference/', {
                teacher: parseInt(teacherId),
                discipline: parseInt(disciplineId),
                lesson_type: parseInt(lessonTypeId),
                room: parseInt(roomId)
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setSuccess('Предпочтение аудитории успешно добавлено.');
            setTeacherId('');
            setDisciplineId('');
            setLessonTypeId('');
            setRoomId('');
        } catch (err) {
            setError('Ошибка при создании предпочтения аудитории.');
            console.error(err);
        }
    };

    return (
        <div className="page-container">
            <Navigation links={[['/admin/create-teacher-room', 'Предпочтение аудитории']]} />
            <div className="form-container">
                <div className="form-header">
                    <h2>Предпочтение аудитории преподавателя</h2>
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
                        <label>Дисциплина:</label>
                        <select value={disciplineId} onChange={(e) => setDisciplineId(e.target.value)} required>
                            <option value="">-- Выберите --</option>
                            {disciplines.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-input-group">
                        <label>Тип занятия:</label>
                        <select value={lessonTypeId} onChange={(e) => setLessonTypeId(e.target.value)} required>
                            <option value="">-- Выберите --</option>
                            {lessonTypes.map(l => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-input-group">
                        <label>Аудитория:</label>
                        <select value={roomId} onChange={(e) => setRoomId(e.target.value)} required>
                            <option value="">-- Выберите --</option>
                            {rooms.map(r => (
                                <option key={r.id} value={r.id}>{r.building_code}-{r.number}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="form-submit-button">Сохранить</button>
                </form>
            </div>
        </div>
    );
}

export default CreateTeacherRoomPreferencePage;

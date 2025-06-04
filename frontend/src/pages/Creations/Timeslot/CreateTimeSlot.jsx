import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navigation from '../../../components/navigation/navigation';
import { useNavigate } from 'react-router-dom';
import '../../Pages.css';
import '../../../assets/form.css';

function CreateTimeSlotPage() {
    const [weekdayId, setWeekdayId] = useState('');
    const [pairId, setPairId] = useState('');
    const [isEvenWeek, setIsEvenWeek] = useState(false);
    const [weekdays, setWeekdays] = useState([]);
    const [pairs, setPairs] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const headers = { 'Authorization': `Bearer ${token}` };

                const [weekdayRes, pairRes] = await Promise.all([
                    axios.get('http://localhost:8000/api/list/weekday/', { headers }),
                    axios.get('http://localhost:8000/api/list/pair/', { headers }),
                ]);

                setWeekdays(weekdayRes.data);
                setPairs(pairRes.data);
            } catch (err) {
                console.error("Ошибка при загрузке опций:", err);
            }
        };
        fetchOptions();
    }, []);

    const handleGoBack = () => navigate(-1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!weekdayId || !pairId) {
            setError('Все поля обязательны.');
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.post(
                'http://localhost:8000/api/create/timeslot/',
                {
                    weekday: parseInt(weekdayId),
                    is_even_week: isEvenWeek,
                    pair: parseInt(pairId)
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            setSuccess('Временной слот успешно создан!');
            setWeekdayId('');
            setPairId('');
            setIsEvenWeek(false);
        } catch (err) {
            let errorMessage = 'Ошибка создания временного слота.';
            if (err.response?.data) {
                const serverError = err.response.data;
                errorMessage = Object.entries(serverError)
                    .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
                    .join('; ');
            }
            setError(errorMessage);
            console.error('Create timeslot error:', err);
        }
    };

    return (
        <div className="page-container">
            <Navigation links={[
                ['/admin/create-timeslot', 'Создание временного слота'],
                ['/admin/create-weekday', 'Создание дня недели'],
                ['/admin/create-pair', 'Создание пары'],
                ['/admin/create-room', 'Создание аудитории']
            ]} />
            <div className="form-container">
                <div className="form-header">
                    <h2>Создание временного слота</h2>
                    <button onClick={handleGoBack} className="form-back-button">← Назад</button>
                </div>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-input-group">
                        <label htmlFor="weekday">День недели:</label>
                        <select id="weekday" value={weekdayId} onChange={(e) => setWeekdayId(e.target.value)} required>
                            <option value="">-- Выберите день --</option>
                            {weekdays.map(wd => (
                                <option key={wd.id} value={wd.id}>{wd.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="pair">Пара:</label>
                        <select id="pair" value={pairId} onChange={(e) => setPairId(e.target.value)} required>
                            <option value="">-- Выберите пару --</option>
                            {pairs.map(p => (
                                <option key={p.id} value={p.id}>{p.building_code} - Пара {p.number}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-input-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={isEvenWeek}
                                onChange={(e) => setIsEvenWeek(e.target.checked)}
                            />
                            Четная неделя?
                        </label>
                    </div>
                    <button type="submit" className="form-submit-button">Создать слот</button>
                </form>
            </div>
        </div>
    );
}

export default CreateTimeSlotPage;

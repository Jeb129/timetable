// src/pages/InitializeTimeSlotsPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Pages.css'; // Используем общие стили

function InitializeTimeSlotsPage() {
    const [weekdays, setWeekdays] = useState([]);
    const [pairs, setPairs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState([]); // Для логов процесса
    const [error, setError] = useState('');
    const token = localStorage.getItem('accessToken');

    useEffect(() => {
        if (!token) {
            setError("Требуется аутентификация для доступа к этой странице.");
            return;
        }
        const fetchData = async () => {
            setIsLoading(true);
            setError('');
            setMessages(prev => [...prev, "Загрузка дней недели и пар..."]);
            try {
                const [weekdaysRes, pairsRes] = await Promise.all([
                    axios.get('http://localhost:8000/api/list/weekday/', { headers: { 'Authorization': `Bearer ${token}` } }),
                    axios.get('http://localhost:8000/api/list/pair/', { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                setWeekdays(weekdaysRes.data || []);
                setPairs(pairsRes.data || []);
                setMessages(prev => [...prev, `Загружено: ${weekdaysRes.data?.length || 0} дней, ${pairsRes.data?.length || 0} пар.`]);
                if ((weekdaysRes.data?.length === 0) || (pairsRes.data?.length === 0)) {
                    setError("Необходимо сначала создать Дни недели и Пары (звонки) в соответствующих разделах.");
                }
            } catch (err) {
                console.error("Ошибка загрузки справочников:", err);
                setError("Не удалось загрузить дни недели или пары.");
                setMessages(prev => [...prev, "Ошибка загрузки справочников."]);
            }
            setIsLoading(false);
        };
        fetchData();
    }, [token]);

    const handleGenerateTimeSlots = async () => {
        if (!weekdays.length || !pairs.length) {
            setError("Нет данных о днях недели или парах для генерации таймслотов.");
            return;
        }
        if (!token) {
             setError("Ошибка: токен аутентификации не найден.");
             return;
        }

        setIsLoading(true);
        setError('');
        setMessages(["Начало генерации таймслотов..."]);
        let successCount = 0;
        let errorCount = 0;

        for (const weekday of weekdays) {
            for (const pair of pairs) {
                for (const isEven of [true, false]) {
                    const payload = {
                        weekday: weekday.id,
                        pair: pair.id,
                        is_even_week: isEven
                    };
                    try {
                        // Проверка, существует ли уже такой таймслот (опционально, бэкенд должен это обрабатывать с unique_together)
                        // const existingSlots = await axios.get(`/api/list/timeslot/?weekday=${weekday.id}&pair=${pair.id}&is_even_week=${isEven}`, { headers });
                        // if (existingSlots.data.length > 0) {
                        //    setMessages(prev => [...prev, `Слот для ${weekday.short_name}, пара ${pair.number} (${pair.building}), ${isEven ? 'Чет' : 'Неч'} - уже существует.`]);
                        //    continue;
                        // }

                        await axios.post('http://localhost:8000/api/create/timeslot/', payload, {
                            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                        });
                        setMessages(prev => [...prev, `Успешно создан слот: ${weekday.short_name}, пара ${pair.number} (корп. ${pair.building_code || pair.building}), ${isEven ? 'Чет' : 'Неч'}`]);
                        successCount++;
                    } catch (err) {
                        const errorData = err.response?.data;
                        let serverErrorMsg = JSON.stringify(errorData);
                        // Если ошибка о дубликате из-за unique_together (например, DRF возвращает non_field_errors или поле с ошибкой)
                        if (errorData && (errorData.non_field_errors || errorData.unique_together)) {
                             serverErrorMsg = "Слот уже существует или нарушена уникальность.";
                             // Не считаем это критической ошибкой, если get_or_create не используется на бэкенде
                        } else {
                            errorCount++;
                        }
                        setMessages(prev => [...prev, `Ошибка создания слота для ${weekday.short_name}, пара ${pair.number}: ${serverErrorMsg}`]);
                        console.error("Ошибка создания TimeSlot:", err.response?.data || err.message || err);
                    }
                }
            }
        }
        setMessages(prev => [...prev, `Генерация завершена. Успешно создано/обработано: ${successCount}, ошибок: ${errorCount}.`]);
        setIsLoading(false);
    };

    return (
        <div className="admin-form-page-container">
            <div className="admin-form-wrapper" style={{maxWidth: '800px'}}>
                <h2>Инициализация временных слотов (TimeSlots)</h2>
                {error && <p className="error-message" style={{whiteSpace: 'pre-wrap'}}>{error}</p>}
                
                {!token && <p>Пожалуйста, войдите в систему для выполнения этой операции.</p>}

                {token && !isLoading && weekdays.length > 0 && pairs.length > 0 && (
                    <button 
                        onClick={handleGenerateTimeSlots} 
                        disabled={isLoading}
                        className="admin-form-submit-button"
                        style={{marginBottom: '20px'}}
                    >
                        {isLoading ? "Генерация..." : "Сгенерировать все TimeSlots"}
                    </button>
                )}
                 {token && !isLoading && (weekdays.length === 0 || pairs.length === 0) && !error && (
                    <p>Пожалуйста, сначала добавьте Дни недели и Пары (звонки) через соответствующие разделы администрирования.</p>
                )}


                <div className="logs-container" style={{maxHeight: '400px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', background: '#f9f9f9', marginTop: '10px'}}>
                    <h4>Лог операций:</h4>
                    {messages.map((msg, index) => (
                        <p key={index} style={{margin: '2px 0', fontSize: '0.9em'}}>{msg}</p>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default InitializeTimeSlotsPage;
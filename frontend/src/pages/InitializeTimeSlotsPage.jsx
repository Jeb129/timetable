// src/pages/InitializeTimeSlotsPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Добавим для кнопки "Назад"
import './Pages.css'; 

function InitializeTimeSlotsPage() {
    const [weekdays, setWeekdays] = useState([]);
    const [pairs, setPairs] = useState([]); // Массив объектов пар {id, number, building, building_code?, start_time, end_time}
    const [isLoadingData, setIsLoadingData] = useState(false); // Для загрузки справочников
    const [isGenerating, setIsGenerating] = useState(false);  // Для процесса генерации
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState('');
    const token = localStorage.getItem('accessToken');
    const navigate = useNavigate();

    const addMessage = (type, text) => {
        setMessages(prev => [...prev, { type, text, time: new Date().toLocaleTimeString() }]);
    };

    const handleGoBack = () => navigate(-1);

    useEffect(() => {
        if (!token) {
            setError("Требуется аутентификация.");
            addMessage('error', "Токен не найден.");
            return;
        }
        const fetchData = async () => {
            setIsLoadingData(true);
            setError('');
            addMessage('info', "Загрузка дней недели и пар...");
            try {
                const [weekdaysRes, pairsRes] = await Promise.all([
                    axios.get('http://localhost:8000/api/list/weekday/', { headers: { 'Authorization': `Bearer ${token}` } }),
                    axios.get('http://localhost:8000/api/list/pair/', { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                
                const loadedWeekdays = weekdaysRes.data || [];
                const loadedPairs = pairsRes.data || [];

                setWeekdays(loadedWeekdays);
                setPairs(loadedPairs);

                addMessage('info', `Загружено: ${loadedWeekdays.length} дней, ${loadedPairs.length} пар.`);
                
                if (loadedWeekdays.length === 0 || loadedPairs.length === 0) {
                    const missing = [];
                    if (loadedWeekdays.length === 0) missing.push("Дни недели");
                    if (loadedPairs.length === 0) missing.push("Пары (звонки)");
                    setError(`Необходимо сначала создать: ${missing.join(' и ')}.`);
                    addMessage('warn', `Данные для генерации отсутствуют: ${missing.join(' и ')}.`);
                }
            } catch (err) {
                console.error("Ошибка загрузки справочников:", err.response?.data || err.message || err);
                const errMsg = "Не удалось загрузить дни недели или пары. Проверьте API и консоль.";
                setError(errMsg);
                addMessage('error', errMsg);
            }
            setIsLoadingData(false);
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

        setIsGenerating(true);
        setError('');
        setMessages([{ type: 'info', text: "Начало генерации таймслотов...", time: new Date().toLocaleTimeString() }]);
        let successCount = 0;
        let skippedCount = 0;
        let errorCount = 0;
        const totalOperations = weekdays.length * pairs.length * 2;
        let operationsDone = 0;

        for (const weekday of weekdays) {
            for (const pair of pairs) {
                for (const isEven of [true, false]) {
                    operationsDone++;
                    const progressMsg = `Обработка (${operationsDone}/${totalOperations}): ${weekday.short_name}, пара ${pair.number} (корп. ${pair.building_code || pair.building}), ${isEven ? 'Чет' : 'Неч'}`;
                    // Обновляем сообщение о прогрессе, заменяя предыдущее сообщение о прогрессе
                    setMessages(prev => {
                        const lastMsg = prev[prev.length -1];
                        if (lastMsg && lastMsg.text.startsWith("Обработка")) {
                            return [...prev.slice(0, -1), {type: 'info', text: progressMsg, time: new Date().toLocaleTimeString()}];
                        }
                        return [...prev, {type: 'info', text: progressMsg, time: new Date().toLocaleTimeString()}];
                    });


                    const payload = {
                        weekday: weekday.id, // Ожидаем ID
                        pair: pair.id,       // Ожидаем ID
                        is_even_week: isEven
                    };

                    try {
                        // Шаг 1: Проверка, существует ли уже такой таймслот
                        // Это требует, чтобы ваш /api/list/timeslot/ поддерживал фильтрацию
                        const checkUrl = `http://localhost:8000/api/list/timeslot/?weekday=${payload.weekday}&pair=${payload.pair}&is_even_week=${payload.is_even_week}`;
                        const existingSlotsRes = await axios.get(checkUrl, { 
                            headers: { 'Authorization': `Bearer ${token}` } 
                        });

                        if (existingSlotsRes.data && existingSlotsRes.data.length > 0) {
                            addMessage('skip', `Слот для ${weekday.short_name}, пара ${pair.number} (корп. ${pair.building_code || pair.building}), ${isEven ? 'Чет' : 'Неч'} - уже существует.`);
                            skippedCount++;
                            continue; // Переходим к следующей итерации
                        }

                        // Шаг 2: Если не существует, создаем
                        await axios.post('http://localhost:8000/api/create/timeslot/', payload, {
                            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                        });
                        addMessage('success', `УСПЕХ: ${weekday.short_name}, пара ${pair.number} (корп. ${pair.building_code || pair.building}), ${isEven ? 'Чет' : 'Неч'}`);
                        successCount++;
                    } catch (err) {
                        const errorData = err.response?.data;
                        let serverErrorMsg = JSON.stringify(errorData || err.message);
                        addMessage('error', `ОШИБКА для ${weekday.short_name}, пара ${pair.number}: ${serverErrorMsg}`);
                        console.error("Ошибка создания/проверки TimeSlot:", err.response?.data || err.message || err);
                        errorCount++;
                    }
                }
            }
        }
        addMessage('info', `Генерация завершена. Создано: ${successCount}, Пропущено (уже были): ${skippedCount}, Ошибок: ${errorCount}.`);
        setIsGenerating(false);
    };

    if (isLoadingData) {
        return (
            <div className="admin-form-page-container">
                <div className="admin-form-wrapper">
                    <h2>Инициализация временных слотов</h2>
                    <p>Загрузка необходимых данных...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-form-page-container">
            <div className="admin-form-wrapper" style={{maxWidth: '800px'}}>
                <div className="admin-form-header">
                    <h2>Инициализация временных слотов (TimeSlots)</h2>
                    <button onClick={handleGoBack} className="admin-form-back-button">
                        ← Назад 
                    </button>
                </div>

                {error && <p className="error-message" style={{whiteSpace: 'pre-wrap'}}>{error}</p>}
                
                {!token && <p className="info-text">Пожалуйста, войдите в систему для выполнения этой операции.</p>}

                {token && (weekdays.length === 0 || pairs.length === 0) && !error && (
                    <p className="info-text">
                        Необходимо сначала создать "Дни недели" и "Пары (звонки)" через соответствующие разделы администрирования.
                        Сейчас загружено: {weekdays.length} дн., {pairs.length} пар.
                    </p>
                )}

                {token && weekdays.length > 0 && pairs.length > 0 && (
                    <button 
                        onClick={handleGenerateTimeSlots} 
                        disabled={isGenerating}
                        className="admin-form-submit-button"
                        style={{marginBottom: '20px', backgroundColor: isGenerating ? '#ccc' : '#28a745'}}
                    >
                        {isGenerating ? `Генерация (${messages.filter(m=>m.text.startsWith("Обработка")).pop()?.text.split(' ')[1] || '...'})` : "Сгенерировать/Проверить все TimeSlots"}
                    </button>
                )}

                <div className="logs-container" style={{maxHeight: '400px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', background: '#f0f0f0', marginTop: '10px', fontFamily: 'monospace', fontSize: '0.85em'}}>
                    <h4>Лог операций:</h4>
                    {messages.slice().reverse().map((msg, index) => ( // reverse для отображения последних сообщений вверху
                        <p key={messages.length - index} className={`log-message log-${msg.type}`}>
                           [{msg.time}] {msg.text}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default InitializeTimeSlotsPage;
import { useState, useEffect } from 'react';

export const useInbox = (limit = 5) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch(`/api/v1/messages/recent?limit=${limit}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) throw new Error('Failed to fetch messages');
                const data = await response.json();
                setMessages(data.messages);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [limit]);

    return { messages, loading, error };
};

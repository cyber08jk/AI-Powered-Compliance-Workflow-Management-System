import { useState, useEffect } from 'react';

/**
 * SLA Countdown hook — returns time remaining and status
 */
export const useSLACountdown = (dueDate, slaBreached) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [status, setStatus] = useState('on-track');

    useEffect(() => {
        if (slaBreached) {
            setStatus('breached');
            setTimeLeft('BREACHED');
            return;
        }

        const update = () => {
            const now = new Date();
            const due = new Date(dueDate);
            const diff = due - now;

            if (diff <= 0) {
                setStatus('breached');
                setTimeLeft('OVERDUE');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (days > 2) {
                setStatus('on-track');
            } else if (days >= 1) {
                setStatus('warning');
            } else {
                setStatus('warning');
            }

            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h`);
            } else if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m`);
            } else {
                setTimeLeft(`${minutes}m`);
            }
        };

        update();
        const interval = setInterval(update, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [dueDate, slaBreached]);

    return { timeLeft, status };
};

export default useSLACountdown;

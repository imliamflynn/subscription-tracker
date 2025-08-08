const handleFeedback = async (group, isConfirmed, onFeedback) => {
    try {
        const response = await fetch('http://localhost:2000/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                vendor: group.vendor,
                amount: group.amount,
                interval: group.interval,
                isConfirmed
            }),
        });

        const result = await response.json();
        console.log(result.message);

        // Let the calling component decide what to do after feedback is sent
        if (typeof onFeedback === 'function') {
            onFeedback(group.vendor, group.amount, group.interval, isConfirmed);
        }
    } catch (err) {
        console.error('Feedback failed:', err);
    }
};

export default handleFeedback;
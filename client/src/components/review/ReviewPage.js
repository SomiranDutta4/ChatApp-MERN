import { useEffect, useState, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../Context/ContextProvider';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ReviewPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { URL, User } = useContext(AppContext);

    const [rating, setRating] = useState('');
    const [feedback, setFeedback] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const shouldReload = searchParams.get('reload') === 'true';
        if (shouldReload) {
            searchParams.delete('reload');
            setSearchParams(searchParams);
            window.location.reload();
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating || !feedback) return;

        setLoading(true);
        try {
            await axios.post(`${URL}/user/feedback?token=${User.token}`, { rating, feedback });
            setSubmitted(true);
        } catch (err) {
            console.error('Submission error:', err);
            toast.error('Failed to submit feedback. Please try again.');
        }
        setLoading(false);
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center w-screen h-screen bg-[#1f1f1f] text-white px-4">
                <h1 className="text-2xl font-semibold mb-2">Thank you!</h1>
                <p className="text-gray-400 text-center max-w-md mb-4">
                    Your feedback has been submitted successfully.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                    Submit Another Feedback
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center w-screen h-screen bg-[#1f1f1f] text-white px-4">
            <ToastContainer position="top-right" autoClose={3000} />
            <h1 className="text-3xl font-semibold mb-4">Review This Service</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
                <label className="text-sm font-medium">
                    Rate your experience:
                    <select
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        required
                        className="mt-1 block w-full p-2 bg-gray-800 border border-gray-600 rounded"
                    >
                        <option value="" disabled>Select</option>
                        <option>Excellent</option>
                        <option>Good</option>
                        <option>Okay</option>
                        <option>Poor</option>
                        <option>Terrible</option>
                    </select>
                </label>

                <label className="text-sm font-medium">
                    Your feedback:
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        required
                        className="mt-1 block w-full p-2 bg-gray-800 border border-gray-600 rounded"
                        rows="4"
                        placeholder="Let me know what went well or what could be improved."
                    />
                </label>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                >
                    {loading ? 'Submitting...' : 'Submit Feedback'}
                </button>
            </form>
        </div>
    );
};

export default ReviewPage;

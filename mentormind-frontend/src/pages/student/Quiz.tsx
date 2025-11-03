import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';

// Simple Loading Spinner Component
const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
  </div>
);

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
}

interface QuizResult {
  score: number;
  feedback: string;
}

const Quiz: React.FC = () => {
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);

  const generateQuiz = async () => {
    setLoading(true);
    setQuiz(null);
    setQuizResult(null);
    setSelectedAnswers({});
    try {
      const response = await axiosClient.post('/quiz/generate');
      setQuiz(response.data.questions); // Assuming API returns { questions: QuizQuestion[] }
      toast.success('Quiz generated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to generate quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const submitQuiz = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.post('/quiz/submit', { answers: selectedAnswers });
      setQuizResult(response.data); // Assuming API returns { score: number, feedback: string }
      toast.success('Quiz submitted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to submit quiz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Take a Quiz!</h1>
      
      {loading && <LoadingSpinner />}

      {!loading && !quiz && !quizResult && (
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md mx-auto">
          <p className="text-xl text-gray-700 mb-6">Ready to test your knowledge?</p>
          <p className="text-lg text-gray-600 mb-8">Click the button below to generate a new quiz and begin your challenge!</p>
          <button
            onClick={generateQuiz}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            disabled={loading}
          >
            Generate New Quiz
          </button>
        </div>
      )}

      {!loading && quiz && (
        <div className="mt-8 max-w-2xl mx-auto">
          {quiz.map((q, qIndex) => (
            <div key={q.id} className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Question {qIndex + 1} of {quiz.length}</p>
              <p className="text-xl font-semibold text-gray-800 mb-4">
                {q.question}
              </p>
              <div className="space-y-3">
                {q.options.map((option, index) => (
                  <div key={index}>
                    <label
                      className={`inline-flex items-center text-lg text-gray-700 cursor-pointer p-3 rounded-lg w-full transition-all duration-200 ease-in-out ${
                        selectedAnswers[q.id] === option
                          ? 'bg-blue-100 border-blue-500 border-2 shadow-md'
                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        className="form-radio h-5 w-5 text-blue-600 focus:ring-blue-500"
                        name={`question-${q.id}`}
                        value={option}
                        checked={selectedAnswers[q.id] === option}
                        onChange={() => handleAnswerChange(q.id, option)}
                        aria-labelledby={`question-${q.id}-option-${index}`}
                      />
                      <span id={`question-${q.id}-option-${index}`} className="ml-3 font-medium">{option}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={submitQuiz}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            disabled={loading}
          >
            Submit Quiz
          </button>
        </div>
      )}

      {!loading && quizResult && (
        <div className="mt-8 bg-white p-8 rounded-xl shadow-lg text-center max-w-md mx-auto border border-gray-200">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-4">Quiz Result</h2>
          <p className={`text-6xl font-bold mb-4 ${quizResult.score >= 70 ? 'text-green-600' : 'text-red-600'}`}>
            {quizResult.score}%
          </p>
          <p className="text-xl text-gray-700 mb-6">{quizResult.feedback}</p>
          <button
            onClick={generateQuiz}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            disabled={loading}
          >
            Generate Another Quiz
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;

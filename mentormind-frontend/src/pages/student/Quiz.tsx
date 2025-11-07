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
  question_text: string;
  options: string[];
  correct_answer: string;
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
  
  // Form state
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState<number | ''>(9);
  const [numQuestions, setNumQuestions] = useState<number | ''>(5);

  const generateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !grade || !numQuestions) {
      toast.error('Please fill out all fields to generate a quiz.');
      return;
    }
    
    setLoading(true);
    setQuiz(null);
    setQuizResult(null);
    setSelectedAnswers({});
    
    try {
      const response = await axiosClient.post('/quiz/generate', {
        topic,
        grade: Number(grade),
        num_questions: Number(numQuestions),
      });
      if (response.data && response.data.questions) {
        setQuiz(response.data.questions);
        toast.success('Quiz generated successfully!');
      } else {
        throw new Error("Invalid quiz format from server.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to generate quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionText: string, answer: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionText]: answer }));
  };

  const submitQuiz = async () => {
    if (!quiz) return;
    
    setLoading(true);
    try {
      const submissionPayload = {
        topic,
        grade: Number(grade),
        questions: quiz,
        answers: selectedAnswers,
      };
      
      const response = await axiosClient.post('/quiz/submit', submissionPayload);
      
      setQuizResult(response.data); // API returns { score, feedback, ... }
      toast.success('Quiz submitted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to submit quiz.');
    } finally {
      setLoading(false);
    }
  };
  
  const resetQuiz = () => {
    setQuiz(null);
    setQuizResult(null);
    setSelectedAnswers({});
    setTopic('');
    setGrade(9);
    setNumQuestions(5);
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Take a Quiz!</h1>
      
      {loading && <LoadingSpinner />}

      {!loading && !quiz && !quizResult && (
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-lg mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quiz Setup</h2>
          <form onSubmit={generateQuiz} className="space-y-6">
            <div>
              <label htmlFor="topic" className="block text-lg font-medium text-gray-700 text-left mb-2">
                Topic
              </label>
              <input
                    type="text"
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., 'Newton's Laws of Motion'"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                    required
                  />
            </div>
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label htmlFor="grade" className="block text-lg font-medium text-gray-700 text-left mb-2">
                  Grade
                </label>
                <select
                  id="grade"
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                  required
                >
                  <option value="9">9th Grade</option>
                  <option value="10">10th Grade</option>
                </select>
              </div>
              <div className="w-1/2">
                <label htmlFor="numQuestions" className="block text-lg font-medium text-gray-700 text-left mb-2">
                  # of Questions
                </label>
                <input
                  type="number"
                  id="numQuestions"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  min="3"
                  max="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              disabled={loading}
            >
              Generate Quiz
            </button>
          </form>
        </div>
      )}

      {!loading && quiz && !quizResult && (
        <div className="mt-8 max-w-2xl mx-auto">
          {quiz.map((q, qIndex) => (
            <div key={qIndex} className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Question {qIndex + 1} of {quiz.length}</p>
              <p className="text-xl font-semibold text-gray-800 mb-4">
                {q.question_text}
              </p>
              <div className="space-y-3">
                {q.options.map((option, index) => (
                  <div key={index}>
                    <label
                      className={`inline-flex items-center text-lg text-gray-700 cursor-pointer p-3 rounded-lg w-full transition-all duration-200 ease-in-out ${
                        selectedAnswers[q.question_text] === option
                          ? 'bg-blue-100 border-blue-500 border-2 shadow-md'
                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        className="form-radio h-5 w-5 text-blue-600 focus:ring-blue-500"
                        name={`question-${qIndex}`}
                        value={option}
                        checked={selectedAnswers[q.question_text] === option}
                        onChange={() => handleAnswerChange(q.question_text, option)}
                      />
                      <span className="ml-3 font-medium">{option}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={submitQuiz}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            disabled={loading || Object.keys(selectedAnswers).length !== quiz.length}
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
            onClick={resetQuiz}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            disabled={loading}
          >
            Take Another Quiz
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;

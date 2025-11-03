import React, { useState } from "react";
import axiosClient from "../../api/axiosClient";
import toast from "react-hot-toast";

const AskTutor: React.FC = () => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    try {
      await axiosClient.post("/rag/ask", { question });
      toast.success("Question submitted successfully!");
      setQuestion("");
    } catch (error: any) {
      toast.error(
        error.response?.data?.detail || "Failed to get answer from AI tutor."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf8f4] flex flex-col items-center py-10">
      {/* Navbar */}
      <header className="w-full flex justify-between items-center px-10 mb-12">
        <div className="flex items-center space-x-2">
          <div className="bg-black text-white font-bold px-2 py-1 rounded">M</div>
          <span className="font-semibold text-lg text-gray-800">MentorMind</span>
        </div>
        <nav className="space-x-8 text-gray-700 font-medium">
          <a href="/dashboard" className="hover:text-black">Dashboard</a>
          <a href="/ask-tutor" className="hover:text-black">Ask Tutor</a>
          <a href="/quiz" className="hover:text-black">Quiz</a>
          <a href="/profile" className="hover:text-black flex items-center space-x-1">
            <div className="w-6 h-6 bg-gray-300 rounded-full" />
            <span>Profile</span>
          </a>
        </nav>
      </header>

      {/* Ask Tutor Section */}
      <div className="w-full max-w-3xl px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Ask Tutor</h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-start space-y-6"
        >
          <textarea
            className="w-full h-48 p-6 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-400"
            placeholder="Type your question here"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="px-8 py-3 bg-[#d4cbbf] text-gray-800 font-semibold rounded-md hover:bg-[#c3b8a9] transition disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AskTutor;

# /mentormind-backend/app/services/report_service.py

def generate_report_content(report_data: dict) -> str:
    """
    Generates a human-readable report string from structured data.
    """
    content = f"Weekly Performance Report for: {report_data['student_name']}\n"
    content += "=" * 40 + "\n\n"
    
    content += f"Summary:\n"
    content += f"- Total Quizzes Attempted: {report_data['quiz_attempts']}\n"
    content += f"- Average Score: {report_data.get('average_score', 0.0):.2f}%\n"
    content += f"- Lessons Completed: {report_data.get('lessons_completed', 0)}\n"
    content += f"- Current Learning Streak: {report_data.get('learning_streak_days', 0)} days\n\n"
    
    if report_data.get('weak_topics'):
        content += "Topics to Focus On:\n"
        for topic in report_data['weak_topics']:
            content += f"- {topic}\n"
    else:
        content += "Great job! No specific weak topics identified this week.\n"
        
    content += "\nKeep up the great work!\n"
    
    return content

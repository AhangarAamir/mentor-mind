# /mentormind-backend/app/services/report_service.py

def generate_report_content(report_data: dict) -> str:
    """
    Generates a human-readable report string from structured data.
    """
    content = f"Weekly Performance Report for: {report_data['student_name']}\n"
    content += "=" * 40 + "\n\n"
    
    content += f"Summary:\n"
    content += f"- Total Quizzes Attempted: {report_data['quiz_attempts']}\n"
    content += f"- Average Score: {report_data['average_score']:.2f}%\n\n"
    
    if report_data['weak_topics']:
        content += "Topics to Focus On:\n"
        for topic in report_data['weak_topics']:
            content += f"- {topic}\n"
    else:
        content += "Great job! No specific weak topics identified this week.\n"
        
    content += "\nKeep up the great work!\n"
    
    return content

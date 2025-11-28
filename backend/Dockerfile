# Use an official lightweight Python image
FROM python:3.10-slim
RUN pip install flask 
# Set the working directory in the container
WORKDIR /app

# Copy the requirements and application files
COPY requirements.txt .
COPY app.py .
COPY config.py .
COPY templates/ templates/
COPY static static/
COPY data.json data.json

# Install required dependencies
#RUN pip install --no-cache-dir -r requirements.txt

# Expose the Flask port
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_ENV=production

# Run the application
CMD ["flask", "run", "--host=0.0.0.0", "--port=443"]

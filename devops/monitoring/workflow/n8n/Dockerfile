FROM n8nio/n8n:1.73.1

# Switch to root user to perform installations
USER root

# Install Python 3 and pip
RUN apk add --no-cache python3 py3-pip

# Install Python libraries with --break-system-packages
RUN pip install numpy pandas python-docx --break-system-packages

# Install the required npm packages
RUN npm install -g bcrypt body-parser ovh googleapis --force --legacy-peer-deps

# Switch back to the node user
USER node
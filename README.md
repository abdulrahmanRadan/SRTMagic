# SRTMagic

**SRTMagic** is a project designed to translate subtitle (SRT) files from English to Arabic. It consists of a frontend interface and a backend server that work together to handle file uploads, process translations, and provide feedback on translation progress.

## Project Structure

### Main Directories

- **backend**: Contains the server code for handling translation requests. It uses the `google-translate-api-x` library for translation and `multer` for file handling.
- **frontend**: Contains the React application that allows users to upload files, track translation progress, and receive the translated file.

## Getting Started

### Prerequisites

- **Node.js** (recommended version: >= 14.x)
- **npm** (comes with Node.js)

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/SRTMagic.git
   cd SRTMagic
   ```

2. **Install dependencies**:
   - For the backend:
     ```bash
     cd backend
     npm install
     ```
   - For the frontend:
     ```bash
     cd ../frontend
     npm install
     ```

### Running the Project

1. **Start the backend server**:

   ```bash
   cd backend
   node index.js
   ```

   The backend server will start at `http://localhost:3001`.

2. **Start the frontend server**:
   ```bash
   cd ../frontend
   npm start
   ```
   The frontend application will be available at `http://localhost:3000`.

### Usage

1. Open the frontend application in your browser at `http://localhost:3000`.
2. Upload an SRT file for translation.
3. The application will display real-time translation progress.
4. Once complete, you’ll receive a message with the location of the translated file.

### Features

- **File Upload**: Allows users to upload SRT files for translation.
- **Real-Time Progress**: Uses Server-Sent Events (SSE) to show translation progress.
- **Retry Logic**: Retries translation up to 5 times in case of network errors.
- **Duplicate Check**: Ensures that a file is not re-translated if an Arabic version already exists.

### Troubleshooting

If the translation fails, the application will display an error message. Check that the backend server is running and reachable from the frontend.

### Technologies Used

- **Node.js** and **Express** (backend)
- **React** (frontend)
- **multer** for file uploads
- **google-translate-api-x** for translation
- **Server-Sent Events (SSE)** for real-time progress updates

## License

This project is open-source and available under the [MIT License](LICENSE).

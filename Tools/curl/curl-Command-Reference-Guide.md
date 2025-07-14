# curl Command Reference Guide

## Basic Syntax
```bash
curl [options] [URL]
```

## Common HTTP Methods

### GET Requests (Default)
```bash
# Simple GET request
curl https://api.example.com/users

# GET with query parameters
curl "https://api.example.com/users?page=1&limit=10"

# Explicit GET method
curl -X GET https://api.example.com/users
```

### POST Requests
```bash
# POST with JSON data
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com"}' \
  https://api.example.com/users

# POST with form data
curl -X POST \
  -d "name=John&email=john@example.com" \
  https://api.example.com/users

# POST with file upload
curl -X POST \
  -F "file=@/path/to/file.txt" \
  https://api.example.com/upload
```

### PUT Requests
```bash
# PUT with JSON data
curl -X PUT \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane", "email": "jane@example.com"}' \
  https://api.example.com/users/123
```

### DELETE Requests
```bash
# Simple DELETE
curl -X DELETE https://api.example.com/users/123

# DELETE with headers
curl -X DELETE \
  -H "Authorization: Bearer your-token" \
  https://api.example.com/users/123
```

## Headers and Authentication

### Custom Headers
```bash
# Single header
curl -H "Authorization: Bearer your-token" https://api.example.com/users

# Multiple headers
curl -H "Authorization: Bearer your-token" \
     -H "Content-Type: application/json" \
     -H "User-Agent: MyApp/1.0" \
     https://api.example.com/users
```

### Authentication Types
```bash
# Bearer token
curl -H "Authorization: Bearer your-jwt-token" https://api.example.com/protected

# Basic authentication
curl -u username:password https://api.example.com/protected

# API key in header
curl -H "X-API-Key: your-api-key" https://api.example.com/data

# API key in query parameter
curl "https://api.example.com/data?api_key=your-api-key"
```

## Data Handling

### Sending Data
```bash
# JSON data inline
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}' \
  https://api.example.com/data

# JSON data from file
curl -X POST \
  -H "Content-Type: application/json" \
  -d @data.json \
  https://api.example.com/data

# Form data
curl -X POST \
  -d "field1=value1&field2=value2" \
  https://api.example.com/form

# File upload
curl -X POST \
  -F "file=@document.pdf" \
  -F "description=Important document" \
  https://api.example.com/upload
```

## Output and Response Handling

### Save Response to File
```bash
# Save to specific file
curl -o response.json https://api.example.com/data

# Save with original filename
curl -O https://example.com/file.zip

# Append to file
curl https://api.example.com/data >> log.txt
```

### Response Information
```bash
# Include response headers
curl -i https://api.example.com/data

# Show only headers
curl -I https://api.example.com/data

# Verbose output (debugging)
curl -v https://api.example.com/data

# Silent mode (no progress bar)
curl -s https://api.example.com/data

# Show HTTP status code
curl -w "%{http_code}\n" -s https://api.example.com/data
```

## Advanced Options

### Timeouts and Retries
```bash
# Connection timeout (seconds)
curl --connect-timeout 10 https://api.example.com/data

# Maximum time for entire operation
curl --max-time 30 https://api.example.com/data

# Retry on failure
curl --retry 3 --retry-delay 2 https://api.example.com/data
```

### SSL/TLS Options
```bash
# Ignore SSL certificate errors (not recommended for production)
curl -k https://self-signed.example.com/api

# Use specific SSL version
curl --tlsv1.2 https://api.example.com/data

# Specify certificate bundle
curl --cacert /path/to/ca-bundle.crt https://api.example.com/data
```

### Following Redirects
```bash
# Follow redirects
curl -L https://api.example.com/redirect

# Limit number of redirects
curl -L --max-redirs 5 https://api.example.com/redirect
```

### Cookies
```bash
# Send cookies
curl -b "session_id=abc123; user_pref=dark" https://api.example.com/data

# Save cookies to file
curl -c cookies.txt https://api.example.com/login

# Load cookies from file
curl -b cookies.txt https://api.example.com/protected
```

## Useful Combinations

### Testing API Endpoints
```bash
# Quick health check with status code
curl -s -o /dev/null -w "%{http_code}\n" https://api.example.com/health

# Pretty print JSON response (requires jq)
curl -s https://api.example.com/users | jq '.'

# Test with timing information
curl -w "Total time: %{time_total}s\nHTTP code: %{http_code}\n" \
     -s -o /dev/null https://api.example.com/data
```

### Development and Debugging
```bash
# Test POST endpoint with pretty output
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' \
  -i -s https://api.example.com/test | head -20

# Check headers only
curl -I https://api.example.com/data

# Full debugging output
curl -v -X POST \
  -H "Content-Type: application/json" \
  -d '{"debug": true}' \
  https://api.example.com/debug
```

## Common Use Cases

### API Testing
```bash
# Test GET endpoint
curl https://jsonplaceholder.typicode.com/posts/1

# Test POST endpoint
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "body": "Test post", "userId": 1}' \
  https://jsonplaceholder.typicode.com/posts

# Test with authentication
curl -H "Authorization: Bearer your-token" \
     https://api.github.com/user
```

### File Operations
```bash
# Download file
curl -O https://example.com/file.zip

# Upload file
curl -X POST \
  -F "file=@localfile.txt" \
  https://api.example.com/upload

# Stream large file
curl -N https://api.example.com/stream
```

## Tips and Best Practices

1. **Use quotes around URLs** with special characters or query parameters
2. **Escape or quote JSON data** to avoid shell interpretation
3. **Use `-v` flag** for debugging connection issues
4. **Save complex requests** as shell scripts for reuse
5. **Use `-s` flag** in scripts to suppress progress output
6. **Always validate SSL certificates** in production (avoid `-k`)
7. **Set appropriate timeouts** for automated scripts
8. **Use environment variables** for sensitive data like API keys

### Environment Variables Example
```bash
# Set API key as environment variable
export API_KEY="your-secret-key"

# Use in curl command
curl -H "Authorization: Bearer $API_KEY" https://api.example.com/data
```
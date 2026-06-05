from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
import pandas as pd
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import os
import httpx
import json
from pathlib import Path
from dotenv import load_dotenv
from starlette.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware

# Load environment variables
env_path = Path(__file__).parent / '.env'
print(f"Looking for .env file at: {env_path}")
load_dotenv(dotenv_path=env_path)

app = FastAPI(
    title="College Sorting API",
    description="API for college sorting and comparison"
)

# Custom CORS middleware class
class AllowAllCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Process the request
        response = await call_next(request)
        
        # Add CORS headers to all responses
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Credentials"] = "false"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Max-Age"] = "86400"
        response.headers["Access-Control-Expose-Headers"] = "*"
        
        return response

# Add our custom CORS middleware
app.add_middleware(AllowAllCORSMiddleware)

# Handle OPTIONS requests globally
@app.options("/{full_path:path}")
async def options_handler(request: Request, full_path: str):
    """Handle preflight requests for all routes"""
    return PlainTextResponse(
        "",
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "false",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400",
            "Access-Control-Expose-Headers": "*",
        }
    )

# Debug endpoint to verify CORS
@app.get("/api/debug-cors")
async def debug_cors():
    """
    Debug endpoint to verify CORS headers
    """
    return {
        "status": "ok",
        "message": "CORS headers should be present in response",
        "cors_enabled": True
    }

# Debug environment variables
api_key = os.getenv("GOOGLE_SEARCH_API_KEY")
cx_id = os.getenv("GOOGLE_SEARCH_CX")
print(f"API Key loaded: {bool(api_key)}")
print(f"CX ID loaded: {bool(cx_id)}")

# Data models
class CollegeData(BaseModel):
    status: str
    data: List[Dict[str, Any]]

class ParameterData(BaseModel):
    status: str
    data: List[str]

class SearchResult(BaseModel):
    title: str
    link: str
    snippet: str
    source: str

class SearchResponse(BaseModel):
    results: List[SearchResult]

# Get the path to the CSV file - check multiple possible locations
def get_csv_path():
    """
    Get the path to the CSV file by checking multiple possible locations.
    Also prints debug information about the file search.
    """
    # First check if the file exists in the root directory
    root_csv_path = "/app/Scores with Names.csv"
    if os.path.exists(root_csv_path) and os.path.isfile(root_csv_path):
        print(f"CSV file found in root directory: {root_csv_path}")
        return root_csv_path
    
    # Check if CSV_PATH environment variable is set
    csv_path_env = os.getenv("CSV_PATH")
    if csv_path_env:
        print(f"CSV_PATH environment variable is set to: {csv_path_env}")
        if os.path.exists(csv_path_env):
            # Check if the path is a directory
            if os.path.isdir(csv_path_env):
                print(f"CSV_PATH is a directory: {csv_path_env}")
                # Look for CSV files in the directory
                try:
                    files = os.listdir(csv_path_env)
                    print(f"Files in {csv_path_env}: {files}")
                    csv_files = [f for f in files if f.endswith('.csv')]
                    print(f"CSV files found: {csv_files}")
                    if csv_files:
                        # Use the first CSV file found
                        csv_file_path = os.path.join(csv_path_env, csv_files[0])
                        print(f"Using CSV file: {csv_file_path}")
                        return csv_file_path
                    else:
                        print(f"No CSV files found in directory: {csv_path_env}")
                except Exception as e:
                    print(f"Error listing directory {csv_path_env}: {str(e)}")
            else:
                print(f"CSV file found at environment variable path: {csv_path_env}")
                return csv_path_env
        else:
            print(f"CSV file NOT found at environment variable path: {csv_path_env}")
    
    # Debug: Print current directory and file existence
    current_dir = os.getcwd()
    print(f"Current directory: {current_dir}")
    print(f"Files in current directory: {os.listdir(current_dir)}")
    
    # Check for the CSV file in the current directory
    current_dir_csv = os.path.join(current_dir, "Scores with Names.csv")
    if os.path.exists(current_dir_csv) and os.path.isfile(current_dir_csv):
        print(f"CSV file found in current directory: {current_dir_csv}")
        return current_dir_csv
    
    # Check for sample.csv in the current directory
    sample_csv = os.path.join(current_dir, "sample.csv")
    if os.path.exists(sample_csv) and os.path.isfile(sample_csv):
        print(f"Using sample CSV file in current directory: {sample_csv}")
        return sample_csv
    
    # If /app/data exists, list its contents
    data_dir = "/app/data"
    if os.path.exists(data_dir):
        print(f"Files in {data_dir}: {os.listdir(data_dir)}")
        # Look for CSV files in the data directory
        try:
            files = os.listdir(data_dir)
            csv_files = [f for f in files if f.endswith('.csv') and os.path.isfile(os.path.join(data_dir, f))]
            if csv_files:
                # Use the first CSV file found
                csv_file_path = os.path.join(data_dir, csv_files[0])
                print(f"Using CSV file from data directory: {csv_file_path}")
                return csv_file_path
        except Exception as e:
            print(f"Error listing data directory: {str(e)}")
    
    # Use the sample.csv file we created earlier
    sample_path = os.path.join(os.path.dirname(__file__), "sample.csv")
    if os.path.exists(sample_path):
        print(f"Using existing sample CSV file: {sample_path}")
        return sample_path
    
    # Create and return a sample CSV file as a last resort
    fallback_path = os.path.join(os.path.dirname(__file__), "fallback.csv")
    try:
        print(f"Creating fallback CSV file at: {fallback_path}")
        with open(fallback_path, 'w') as f:
            f.write("ID,Name,Score1,Score2,Score3\n")
            f.write("1,College A,90,85,95\n")
            f.write("2,College B,80,90,85\n")
            f.write("3,College C,85,80,90\n")
            f.write("4,College D,95,75,80\n")
            f.write("5,College E,75,95,85\n")
        return fallback_path
    except Exception as e:
        print(f"Error creating fallback CSV: {str(e)}")
        # Return the first path as default, but it will likely fail
        return "/app/Scores with Names.csv"

@app.get("/api/colleges", response_model=CollegeData)
async def get_colleges():
    """
    Load and return college data from CSV file
    """
    try:
        csv_path = get_csv_path()
        print(f"Using CSV path: {csv_path}")
        
        if not os.path.exists(csv_path):
            error_msg = f"CSV file not found at: {csv_path}"
            print(error_msg)
            raise FileNotFoundError(error_msg)
        
        # Check file size and permissions
        file_size = os.path.getsize(csv_path)
        print(f"CSV file size: {file_size} bytes")
        
        # Try to read the file content directly first
        try:
            with open(csv_path, 'r', encoding='utf-8') as f:
                first_few_lines = ''.join(f.readlines(10))
                print(f"First few lines of CSV file:\n{first_few_lines}")
        except Exception as read_error:
            print(f"Error reading CSV file directly: {str(read_error)}")
        
        # Now try with pandas
        try:
            print("Attempting to read CSV with pandas...")
            df = pd.read_csv(csv_path)
            print(f"CSV loaded successfully. Shape: {df.shape}")
            print(f"CSV columns: {df.columns.tolist()}")
            
            colleges = df.to_dict(orient='records')
            return {"status": "success", "data": colleges}
        except Exception as pandas_error:
            print(f"Error reading CSV with pandas: {str(pandas_error)}")
            # Try with different encoding
            try:
                print("Trying with different encoding (latin-1)...")
                df = pd.read_csv(csv_path, encoding='latin-1')
                colleges = df.to_dict(orient='records')
                return {"status": "success", "data": colleges}
            except Exception as encoding_error:
                print(f"Error with alternative encoding: {str(encoding_error)}")
                raise
    except Exception as e:
        error_msg = f"Error processing CSV file: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

@app.get("/api/parameters", response_model=ParameterData)
async def get_parameters():
    """
    Return available parameters for sorting
    """
    try:
        csv_path = get_csv_path()
        print(f"Using CSV path: {csv_path}")
        
        if not os.path.exists(csv_path):
            error_msg = f"CSV file not found at: {csv_path}"
            print(error_msg)
            raise FileNotFoundError(error_msg)
        
        # Check file size and permissions
        file_size = os.path.getsize(csv_path)
        print(f"CSV file size: {file_size} bytes")
        
        # Try to read the file content directly first
        try:
            with open(csv_path, 'r', encoding='utf-8') as f:
                first_few_lines = ''.join(f.readlines(10))
                print(f"First few lines of CSV file:\n{first_few_lines}")
        except Exception as read_error:
            print(f"Error reading CSV file directly: {str(read_error)}")
        
        # Now try with pandas
        try:
            print("Attempting to read CSV with pandas...")
            df = pd.read_csv(csv_path)
            print(f"CSV loaded successfully. Shape: {df.shape}")
            print(f"CSV columns: {df.columns.tolist()}")
            
            # Get numerical columns only, excluding ID and Name
            numeric_columns = df.select_dtypes(include=['float64', 'int64']).columns.tolist()
            print(f"Numeric columns: {numeric_columns}")
            
            return {"status": "success", "data": numeric_columns}
        except Exception as pandas_error:
            print(f"Error reading CSV with pandas: {str(pandas_error)}")
            # Try with different encoding
            try:
                print("Trying with different encoding (latin-1)...")
                df = pd.read_csv(csv_path, encoding='latin-1')
                numeric_columns = df.select_dtypes(include=['float64', 'int64']).columns.tolist()
                return {"status": "success", "data": numeric_columns}
            except Exception as encoding_error:
                print(f"Error with alternative encoding: {str(encoding_error)}")
                raise
    except Exception as e:
        error_msg = f"Error processing CSV file: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

@app.get("/search", response_model=SearchResponse)
async def search_web_direct(q: str):
    """
    Search endpoint that can be accessed directly without /api prefix
    """
    return await search_web(q)

@app.get("/api/search", response_model=SearchResponse)
async def search_web(q: str):
    """
    Search for college information using Google Custom Search
    """
    try:
        # Get the API key from environment variables
        api_key = os.getenv("GOOGLE_SEARCH_API_KEY")
        cx = os.getenv("GOOGLE_SEARCH_CX")

        # Debug logging
        print(f"Search query: {q}")
        print("API Key present:", bool(api_key))
        print("CX ID present:", bool(cx))

        if not api_key or not cx:
            print("API keys not configured, returning mock data")
            return SearchResponse(results=create_mock_results(q))

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    "https://www.googleapis.com/customsearch/v1",
                    params={
                        "key": api_key,
                        "cx": cx,
                        "q": q,
                        "num": 5
                    },
                    timeout=10.0
                )
                
                # Handle rate limiting
                if response.status_code == 429:
                    print(f"Rate limit reached for Google Search API, returning mock data for query: {q}")
                    return SearchResponse(results=create_mock_results(q))
                
                if response.status_code == 200:
                    data = response.json()
                    if "items" in data:
                        results = []
                        for item in data["items"]:
                            source = item.get("displayLink", "")
                            if "youtube.com" in source:
                                source = "YouTube"
                            elif "reddit.com" in source:
                                source = "Reddit"
                            elif "linkedin.com" in source:
                                source = "LinkedIn"
                            elif "quora.com" in source:
                                source = "Quora"
                            
                            results.append(SearchResult(
                                title=item.get("title", ""),
                                link=item.get("link", ""),
                                snippet=item.get("snippet", ""),
                                source=source
                            ))
                        return SearchResponse(results=results)
                    
                # If no results, return mock data instead of empty list
                print(f"No results found for query: {q}, returning mock data")
                return SearchResponse(results=create_mock_results(q))
            
            except httpx.TimeoutException:
                print(f"Search timeout for query: {q}, returning mock data")
                return SearchResponse(results=create_mock_results(q))
            
            except Exception as e:
                print(f"Search API error: {e}, returning mock data")
                return SearchResponse(results=create_mock_results(q))

    except Exception as e:
        print(f"Server error in search: {e}")
        return SearchResponse(results=create_mock_results(q))

def create_mock_results(query: str) -> List[SearchResult]:
    """Create mock search results based on the query."""
    college_name = query.split()[0]  # Get the first word as college name
    
    return [
        SearchResult(
            title=f"About {college_name} - Overview and History",
            link="https://example.com/overview",
            snippet=f"{college_name} is a prestigious educational institution known for its academic excellence and research. The college offers various undergraduate and postgraduate programs in engineering, technology, and management.",
            source="College Website"
        ),
        SearchResult(
            title=f"{college_name} - Placements and Career Opportunities",
            link="https://example.com/placements",
            snippet=f"Students at {college_name} have excellent placement opportunities with top companies. The college has a dedicated placement cell that provides career guidance and conducts regular placement drives.",
            source="Placements Portal"
        ),
        SearchResult(
            title=f"{college_name} Campus Life - Student Experience",
            link="https://example.com/campus",
            snippet=f"Experience vibrant campus life at {college_name} with modern facilities, sports complexes, and various cultural activities. The college hosts annual technical and cultural festivals.",
            source="Student Blog"
        ),
        SearchResult(
            title=f"{college_name} Research and Innovation",
            link="https://example.com/research",
            snippet=f"{college_name} is at the forefront of research and innovation with state-of-the-art laboratories and research centers. Faculty and students actively participate in cutting-edge research projects.",
            source="Research Portal"
        ),
        SearchResult(
            title=f"{college_name} Alumni Network",
            link="https://example.com/alumni",
            snippet=f"Join the vast network of successful {college_name} alumni spread across the globe. Our alumni have achieved remarkable success in various fields and continue to contribute to the college's growth.",
            source="Alumni Association"
        )
    ]

@app.get("/api/health")
async def health_check():
    """
    Simple health check endpoint
    """
    return {"status": "ok", "message": "API is running"}

@app.get("/api/debug")
async def debug_info():
    """
    Debug endpoint to verify routing
    """
    return {
        "status": "ok",
        "message": "Debug endpoint reached",
        "routes": [{"path": route.path, "name": route.name} for route in app.routes]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 
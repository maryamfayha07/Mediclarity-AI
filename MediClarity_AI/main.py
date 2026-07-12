import uvicorn
import os

if __name__ == "__main__":
    # Standard entry point to start the MediClarity AI local server on port 3000
    port = int(os.getenv("PORT", 3000))
    host = os.getenv("HOST", "0.0.0.0")
    
    print(f"Starting MediClarity AI Python server on http://{host}:{port} ...")
    uvicorn.run("app:app", host=host, port=port, reload=True)

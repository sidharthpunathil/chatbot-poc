from fastapi import FastAPI

from vector_db_routes import router as vector_db_router  # ✅ Make sure this line works

app = FastAPI()

# Root route
@app.get("/")
def root():
    return {"message": "Hello from backend!"}

# ✅ Include your router
app.include_router(vector_db_router)

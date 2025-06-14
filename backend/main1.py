from fastapi import FastAPI
from SearchRetrieval import router

app = FastAPI()
app.include_router(router)

@app.post("/search")
async def root():
    return {"message": "Hello World"}

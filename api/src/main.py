from fastapi import FastAPI

app = FastAPI(docs_url="/")


@app.get("/a")
def read_root() -> dict[str, str]:
    return {"message": "Hello, World!"}

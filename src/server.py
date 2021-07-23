from fastapi import FastAPI, Request, UploadFile, File
from fastapi.templating import Jinja2Templates
import shutil, os
import ocr

app = FastAPI()

templates = Jinja2Templates(directory="templates")

@app.get("/")
def ocr(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/extact-file")
def perform_ocr(image: UploadFile = File(...)):
    file_path = _save_file_to_disc(image, path="temp", save_as="temp")
    text = ocr.read_image(file_path)
    return {"file_name": image.filename, "text": text}

def _save_file_to_disc(uploaded_file, path=".", save_as="default"):
    extension = os.path.splitext(uploaded_file.filename)[-1]
    file_path = os.path.join(path, save_as + extension)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(uploaded_file.file, buffer)
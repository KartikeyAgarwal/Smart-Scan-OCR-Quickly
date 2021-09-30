from fastapi import FastAPI, Request, UploadFile, File, BackgroundTasks
from fastapi.templating import Jinja2Templates
import shutil, os, uuid

from starlette.background import BackgroundTask
import ocr

app = FastAPI()

templates = Jinja2Templates(directory="templates")

@app.get("/")
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/extract-text")
async def perform_ocr(image: UploadFile = File(...)):
    file_path = _save_file_to_disc(image, path="temp", save_as="temp")
    text = await ocr.read_image(file_path)
    print(text)
    return {"file_name": image.filename, "text": text}

@app.post("/bulk-extract-text")
async def bulk_perform_ocr(request: Request, bg_task: BackgroundTasks):
    images = await request.form()
    # print("here")
    folder_name = str(uuid.uuid4())
    os.mkdir(folder_name)

    for image in images.values():
        temp_file = _save_file_to_disc(image, path=folder_name, save_as=image.filename)
        # print("here")
    
    bg_task.add_task(ocr.read_images_from_dir, folder_name, write_to_file=True)
    print("hello1")
    return {"task_id": folder_name, "num_files": len(images)}

@app.get("/bulk-output/{task_id}")
async def bulk_output(task_id):
    text_map = {}
    for file_ in os.listdir(task_id):
        print("here2")
        if file_.endswith("txt"):
            text_map[file_] = open(os.path.join(task_id, file_)).read()
    print("end")
    return {"task_id": task_id, "output": text_map}

def _save_file_to_disc(uploaded_file, path=".", save_as="default"):
    extension = os.path.splitext(uploaded_file.filename)[-1]
    file_path = os.path.join(path, save_as + extension)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(uploaded_file.file, buffer)
    return file_path
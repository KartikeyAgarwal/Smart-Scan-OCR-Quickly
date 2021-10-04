from fastapi import FastAPI, Request, UploadFile, File, BackgroundTasks
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fpdf import FPDF
import shutil, os, uuid
import ocr, re, webbrowser

app = FastAPI()

# mounting - adding a complete "independent" application in a specific path, that then takes care of handling all the sub-paths.
# used to add files as static inside static directory
app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

@app.get("/")
def home(request: Request):
    # Get request to render html template on load
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/extract-text")
async def perform_ocr(image: UploadFile = File(...)):
    # Post request to send the single uploaded file, returns the text and file name as the response
    
    file_path = _save_file_to_disc(image, path="temp", save_as="temp")
    text = await ocr.read_image(file_path)

    print(text)
    return {"file_name": image.filename, "text": text}


@app.post("/bulk-extract-text")
async def bulk_perform_ocr(request: Request, bg_task: BackgroundTasks):
    # Post request which is made when multiple files are uploaded at the same time to perform OCR
    images = await request.form()
    
    folder_name = str(uuid.uuid4())
    # folder_name = "uploads/"+folder_name
    os.mkdir(folder_name)

    for image in images.values():
        temp_file = _save_file_to_disc(image, path=folder_name, save_as=image.filename)
    
    bg_task.add_task(ocr.read_images_from_dir, folder_name, write_to_file=True)
    
    # folder_name = folder_name[8:]
    return {"task_id": folder_name, "num_files": len(images)}


@app.post("/download")
async def download_file(request: Request):
    # Post method to download the converted text to the files as the pdf
    try:
        data = await request.json()
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        
        text=""
        file_name=""
        text_list=[]
        text = data["text"]
        file_name = data["file_name"]
        file_name = file_name.split(".")
        file_name = file_name[0]
        text = ascii(text)
        text_list = text.split("\\n")
        text_list.pop()
        i=1
        for c in text_list:
            print(c)
            pdf.cell(200, 10, txt=c, ln=i, align="C")
            i=i+1

        pdf.output(file_name + ".pdf")
        webbrowser.open(file_name + ".pdf")
        return {"status": True}
    except:
        return {"status": False}


@app.get("/bulk-output/{task_id}")
async def bulk_output(task_id):
    # Get method to display the OCR performed files as the button which can be clicked to open the popup box
    print(task_id)
    text_map = {}
    for file_ in os.listdir(task_id):
        if file_.endswith("txt"):
            print(file_)
            text_map[file_] = open(os.path.join(task_id, file_)).read()

    print("DONE")
    return {"task_id": task_id, "output": text_map}


def _save_file_to_disc(uploaded_file, path=".", save_as="default"):
    # function to save the multiple files selected in the directory 

    extension = os.path.splitext(uploaded_file.filename)[-1]
    file_path = os.path.join(path, save_as + extension)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(uploaded_file.file, buffer)
    return file_path
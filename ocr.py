import pytesseract
import os, sys

async def read_image(image_path, lang="eng"):
    """
    Performs OCR on a single image
    
    # image_path: str, path of the image file
    # lang: str, language to be used while conversion (optional, default is english)
     
    Returns
    # text: str, converted text from image
    """
    print(image_path)
    try:
        pytesseract.pytesseract.tesseract_cmd = '/app/.apt/usr/bin/tesseract'
        # pytesseract.pytesseract.tesseract_cmd = r'c:/Program Files/Tesseract-OCR/tesseract.exe'
        return pytesseract.image_to_string(image_path, lang=lang)
    except:
        return "[ERROR] Unable to process file: {0}".format(image_path)

async def read_images_from_dir(dir_path, lang="eng", write_to_file=False):
    """
    Performs OCR on all the images present in the directory

    # dir_path: str, path to directory of images,
    # lang: languages to be used while conversion (optional, default is english)

    Returns
    # converted_text: mapping of filename to converted text for each image
    """
    converted_text = {}
    for file_ in os.listdir(dir_path):
        if file_.endswith(('png', 'jpg', 'jpeg')):
            file_path = os.path.join(dir_path,file_)
            text = await read_image(file_path, lang=lang)
            converted_text[file_path] = text
    if write_to_file:
        for file_path, text in converted_text.items():
            _write_to_file(text, os.path.splitext(file_path)[0]+ ".txt")
    return converted_text

def _write_to_file(text, file_path):
    """
        HELPER function to write the converted text to a file
    """
    print("[INFO] Writing text to file {0}".format(file_path))
    with open(file_path,"w") as f_path:
        f_path.write(text)

if __name__ == "__main__":
    if len(sys.argv) == 1:
        print("python ocr.py <path>")
        print("Provide the path to an image or the path to a directory containing images")
        exit(1)
    
    if os.path.isdir(sys.argv[1]):
        converted_text_map = read_images_from_dir(sys.argv[1], write_to_file=True)
    elif os.path.exists(sys.argv[1]):
        print(read_image(sys.argv[1]))
    else:
        print("Unable to process this file. Please check if it exists and is readable")
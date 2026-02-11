###########EXTERNAL IMPORTS############

from typing import Dict
import base64
import os
from starlette.datastructures import UploadFile
from PIL import Image
import shutil
import io
from concurrent.futures import ThreadPoolExecutor


#######################################

#############LOCAL IMPORTS#############

from conf.env import APP_DATA_PATH

#######################################

thread_executor = ThreadPoolExecutor(max_workers=4)

class DeviceImageStorage():

    IMAGE_ROOT_PATH = str(f"{APP_DATA_PATH}/device_img")
    IMAGE_UPLOAD_PATH = f"{IMAGE_ROOT_PATH}/upload"
    IMAGE_BIN_PATH = f"{IMAGE_ROOT_PATH}/.bin"
    DEFAULT_IMAGE_SOURCE = "data/device_img/default.png"
    DEFAULT_IMAGE_PATH = f"{IMAGE_ROOT_PATH}/default.png"
    IMAGE_EXTENSION = "png"
    DECODE_TYPE = "utf-8"
    IMAGE_SIZE = 200

    @staticmethod
    def get_default_image() -> Dict[str, str]:
        if not os.path.exists(DeviceImageStorage.DEFAULT_IMAGE_PATH):
            os.makedirs(DeviceImageStorage.IMAGE_ROOT_PATH, exist_ok=True)
            try:
                shutil.copy(DeviceImageStorage.DEFAULT_IMAGE_SOURCE, DeviceImageStorage.DEFAULT_IMAGE_PATH)
            except Exception:
                raise ValueError(f"Couldn't initialize the default device image.")

        with open(DeviceImageStorage.DEFAULT_IMAGE_PATH, "rb") as image:
            img_data = base64.b64encode(image.read()).decode(DeviceImageStorage.DECODE_TYPE)
            path, ext = os.path.splitext(DeviceImageStorage.DEFAULT_IMAGE_PATH)
            img_type = f"image/{ext.lstrip('.')}"
            return {"data": img_data, "type": img_type, "filename": f"{os.path.basename(DeviceImageStorage.DEFAULT_IMAGE_PATH)}"}


    @staticmethod
    def get_image(device_id: int) -> Dict[str, str]:
        image_path = f"{DeviceImageStorage.IMAGE_UPLOAD_PATH}/{device_id}.{DeviceImageStorage.IMAGE_EXTENSION}"

        if os.path.exists(image_path):
            with open(image_path, "rb") as image:
                img_data = base64.b64encode(image.read()).decode(DeviceImageStorage.DECODE_TYPE)
                img_type = f"image/{DeviceImageStorage.IMAGE_EXTENSION}"
                return {"data": img_data, "type": img_type, "filename": f"{os.path.basename(image_path)}"}
            
        return DeviceImageStorage.get_default_image()
    
    @staticmethod
    def __process_image(image: UploadFile, size_px: int) -> Image.Image:

        image_data = image.file.read()

        with Image.open(io.BytesIO(image_data)) as img:

            # If image is in palette (indexed colors) format convert it to RGBA
            if img.mode == "P":
                img = img.convert("RGBA")

            width, height = img.size

            if width <= height:
                new_width = size_px
                new_height = int((height * size_px) / width)
            else:
                new_height = size_px
                new_width = int((width * size_px) / height)

            # High-quality downscaling filter
            RESAMPLE_FILTER = Image.Resampling.LANCZOS

            return img.resize((new_width, new_height), RESAMPLE_FILTER)
            
    @staticmethod
    def save_image(device_id: int, image: UploadFile, existing_to_bin: bool = False) -> bool:

        if not image.content_type or not image.content_type.startswith("image/"):
            return False
        
        try:
            os.makedirs(DeviceImageStorage.IMAGE_UPLOAD_PATH, exist_ok=True)
            if existing_to_bin:
                os.makedirs(DeviceImageStorage.IMAGE_BIN_PATH, exist_ok=True)
            processed_image = DeviceImageStorage.__process_image(image, DeviceImageStorage.IMAGE_SIZE)
            image_path = os.path.join(DeviceImageStorage.IMAGE_UPLOAD_PATH, f"{device_id}.{DeviceImageStorage.IMAGE_EXTENSION}")
            if existing_to_bin and os.path.exists(image_path):
                # Moves existing image to bin
                bin_path = os.path.join(DeviceImageStorage.IMAGE_BIN_PATH, f"{device_id}.{DeviceImageStorage.IMAGE_EXTENSION}")
                shutil.move(image_path, bin_path)
            processed_image.save(image_path, format=DeviceImageStorage.IMAGE_EXTENSION.upper(), optimize=True)
            return True
        except Exception as e:
            return False
        finally:
            # moves image pointer to the beggining so other methods can use the file
            image.file.seek(0)


    @staticmethod
    def delete_image(device_id: int, move_to_bin: bool = False) -> bool:

        try:
            image_path = os.path.join(DeviceImageStorage.IMAGE_UPLOAD_PATH, f"{device_id}.{DeviceImageStorage.IMAGE_EXTENSION}")
            if os.path.exists(image_path):
                if move_to_bin:
                    bin_path = os.path.join(DeviceImageStorage.IMAGE_BIN_PATH, f"{device_id}.{DeviceImageStorage.IMAGE_EXTENSION}")
                    shutil.move(image_path, bin_path)
                else:
                    os.remove(image_path)
                return True
            else:
                return True
        except Exception as e:
            return False

    @staticmethod
    def rollback_image(device_id: int) -> bool:

        image_path = os.path.join(DeviceImageStorage.IMAGE_UPLOAD_PATH, f"{device_id}.{DeviceImageStorage.IMAGE_EXTENSION}")
        bin_path = os.path.join(DeviceImageStorage.IMAGE_BIN_PATH, f"{device_id}.{DeviceImageStorage.IMAGE_EXTENSION}")

        try:
            if os.path.exists(DeviceImageStorage.IMAGE_UPLOAD_PATH) and not os.path.exists(image_path) and os.path.exists(bin_path):
                DeviceImageStorage.delete_image(device_id)
                shutil.move(bin_path, image_path)
                return True
            else:
                return True
        except Exception as e:
            return False
        
    @staticmethod
    def flush_bin() -> bool:

        try:
            if os.path.exists(DeviceImageStorage.IMAGE_BIN_PATH):
                for filename in os.listdir(DeviceImageStorage.IMAGE_BIN_PATH):
                    file_path = os.path.join(DeviceImageStorage.IMAGE_BIN_PATH, filename)
                    if os.path.isfile(file_path):
                        os.remove(file_path)
                return True
            else:
                return True
        except Exception as e:
            return False
from PIL import Image

def remove_white_bg(image_path, output_path):
    img = Image.open(image_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    # threshold for white (e.g. above 240,240,240 is white)
    for item in datas:
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            # Change all white (also shades of white) to transparent
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    remove_white_bg("/Users/efesahin/Desktop/cdh/website/public/logo.png", "/Users/efesahin/Desktop/cdh/website/public/logo_transparent.png")

# CV Dataset & Annotation Format (for when real training becomes possible)

**This folder is currently empty.** There is no annotated e-waste image
dataset available yet - per the master project plan, demo mode
(`src/demo_detector.py`) stands in until one exists. This document
describes what a real dataset needs to look like so it's ready to
plug in later.

## Target classes (Phase 6 initial set)

```
ram, ssd, battery, motherboard, display
```

(Expand later per master prompt section 8 - hdd, gpu, cooling_fan,
wifi_card, charger, keyboard, camera, speaker - once the initial 5
classes have a working pipeline.)

## Required structure

```
dataset/
  images/
    train/
      img_0001.jpg
      img_0002.jpg
      ...
    val/
      img_0101.jpg
      ...
  annotations/
    train/
      img_0001.txt      <- YOLO format, one file per image
      img_0002.txt
    val/
      img_0101.txt
```

## Annotation format (YOLO)

One `.txt` file per image, same filename as the image. Each line is one
bounding box:

```
<class_index> <x_center> <y_center> <width> <height>
```

All coordinates normalized to 0-1 (relative to image width/height).
`class_index` maps to the order in `classes.txt`:

```
0 ram
1 ssd
2 battery
3 motherboard
4 display
```

Example `img_0001.txt` for an image with a visible RAM stick and SSD:
```
0 0.45 0.32 0.15 0.10
1 0.70 0.55 0.20 0.12
```

## Where to get real images/annotations

Per master prompt section 9: "Do not fabricate training images." Real
options once this project moves past demo mode:
- Photograph real components from real e-waste (with a labeling tool
  like LabelImg or CVAT to draw the boxes yourself)
- A properly licensed public e-waste/PC-component dataset, if one can
  be found and its license permits this use
- Crowdsourced photos from repair shops/donors, with consent, labeled
  using the same tool

## Training (once a dataset exists)

Not implemented yet. Planned approach per master prompt section 8: take
a pretrained object detector (e.g. a YOLO variant) and fine-tune it on
this dataset, rather than training from scratch. This would replace
`src/demo_detector.py`'s random selection with a real `model.predict()`
call - the Flask API contract (`/detect` request/response shape) is
designed to stay the same either way, so `app.py` and the whole rest of
the pipeline (Node integration, frontend) shouldn't need to change.

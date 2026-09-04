# cv-service

Python computer-vision microservice for identifying components in
device photos.

## Current status: DEMO CV MODE

**There is no trained detection model.** No annotated e-waste image
dataset was available to train one (fabricating training images isn't
allowed - see master prompt section 9), so per the plan's own fallback
instruction, this service runs in a clearly labeled demo mode:
`src/demo_detector.py` returns randomly chosen example detections
(from a small target-class list) with bounding boxes placed within the
image's real dimensions - it does not analyze actual pixel content.

Every response includes `"mode": "DEMO_CV_MODE"` and a `disclaimer`
string. The Node backend and frontend both surface this - it is never
hidden or softened. See `dataset/ANNOTATION_FORMAT.md` for what a real
dataset would need to look like to replace this.

## Setup

```bash
cd cv-service
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
```

## Run

```bash
./venv/bin/python src/app.py
```

Starts on port 8002 by default (override with `CV_SERVICE_PORT`).

- `GET /health` - service status
- `POST /detect` - multipart/form-data, field `image` (.jpg/.jpeg/.png/.webp, max 8MB)

## Example

```bash
curl -X POST http://localhost:8002/detect -F "image=@photo.jpg"
```

## Moving beyond demo mode

See `dataset/ANNOTATION_FORMAT.md`. Once a real annotated dataset
exists, `src/demo_detector.py`'s random selection gets replaced with a
real trained model's `.predict()` call - the Flask API shape (`/detect`
request/response) is designed to stay identical, so nothing else in the
pipeline (Node integration in `backend/src/services/cvServiceClient.js`,
or the frontend `ImageAnalysis` component) needs to change.

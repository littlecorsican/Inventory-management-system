# Home Inventory

A self-hosted, mobile-first home inventory app (think [Sortly](https://www.sortly.com/) for your house).
Snap a photo of something with your phone, give it a name, pick the box/drawer/shelf it lives in, and find it
again later by searching.

- **Items** – photo, name, quantity, notes, and the container it's stored in
- **Containers** – boxes, drawers, shelves… which can be nested (a box on a shelf in a cupboard) and placed in a room
- **QR labels** – print a label for any container; scanning it with a phone camera opens its contents
- **Rooms** – optional, with a 3D view of where containers are
- **Search** across everything from the home screen
- Works on phones (bottom navigation, full-screen forms, native camera) and desktops (webcam capture supported)

Stack: FastAPI + SQLite backend, React + MUI frontend, shipped as a single Docker image.

## Run it with Docker

```bash
docker compose up -d --build
```

Open <http://localhost:8000>. To use it from your phone, open `http://<your-computer's-LAN-IP>:8000`
(e.g. `http://192.168.1.10:8000`; find the IP with `ipconfig` on Windows or `ip addr` on Linux).
On the phone you can use "Add to Home Screen" to get an app-like icon.

All data (the SQLite database and uploaded photos) lives in the `inventory-data` Docker volume, mounted at `/data`.

Without compose:

```bash
docker build -t home-inventory .
docker run -d -p 8000:8000 -v inventory-data:/data --name home-inventory home-inventory
```

### Backups

Everything is in `/data` (`inventory.db` + `media/`):

```bash
docker run --rm -v inventory-data:/data -v "$PWD":/backup alpine tar czf /backup/inventory-backup.tgz -C /data .
```

### Configuration (environment variables)

| Variable        | Default                     | Purpose                                                |
|-----------------|-----------------------------|--------------------------------------------------------|
| `DATA_DIR`      | `/data` in Docker, `backend/` locally | Where `inventory.db` and `media/` are stored  |
| `MAX_UPLOAD_MB` | `15`                        | Largest photo accepted                                 |
| `CORS_ORIGINS`  | `*`                         | Comma-separated origins allowed to call the API        |
| `STATIC_DIR`    | `backend/static`            | Built frontend to serve (set automatically in Docker)  |

### A note on the camera

The **Camera** button uses the phone's native camera app, which works over plain `http://` on your home network.
The live **Webcam** preview (desktop only) needs `https://` or `localhost`, because browsers only allow
live camera access there. Put the app behind a reverse proxy with HTTPS (Caddy, Traefik, Tailscale serve…)
if you want that on other machines.

## Local development

Run the backend and frontend in two separate terminals.

Backend (Python 3.11+):

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0
```

On macOS/Linux, activate the venv with `source venv/bin/activate` instead.
API docs: <http://localhost:8000/api/docs>

Frontend (Node 20+):

```bash
cd frontend
npm install
npm start
```

Then open <http://localhost:3000>. The frontend forwards API calls to the backend on port 8000.
To use it from your phone, open `http://<your-PC's-LAN-IP>:3000`.

### Tests

```bash
cd backend
pip install -r requirements-dev.txt
pytest

cd frontend
npm test
```

## Project layout

```
backend/
  main.py            FastAPI app: /api routes, /media files, serves the built frontend
  database.py        SQLite engine + lightweight migration for older databases
  models/ schemas/   SQLAlchemy models and Pydantic schemas
  routers/           items, containers, rooms, image upload, stats
  tests/
frontend/src/
  pages/             Dashboard, Items, Containers, ContainerDetail, Rooms
  modals/            Add/edit dialogs
  components/        Cards, ImagePicker, CameraCapture, ContainerSelect, QR label, 3D scene
  context/           App-wide refresh/notifications/editors
Dockerfile           Multi-stage build (React build -> Python runtime)
docker-compose.yml
```

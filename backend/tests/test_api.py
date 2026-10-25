import io
import os

from setting.config import Config


def make_container(client, name, **extra):
    res = client.post("/api/containers/", json={"name": name, **extra})
    assert res.status_code == 200, res.text
    return res.json()


def make_item(client, name, **extra):
    res = client.post("/api/items/", json={"name": name, **extra})
    assert res.status_code == 200, res.text
    return res.json()


def test_item_without_container_is_allowed(client):
    item = make_item(client, "Screwdriver")
    assert item["contained_in"] is None
    assert item["quantity"] == 1
    assert client.get("/api/stats/").json()["unassigned_items"] == 1


def test_item_rejects_unknown_container(client):
    res = client.post("/api/items/", json={"name": "Ghost", "contained_in": 999})
    assert res.status_code == 400


def test_items_search_filter_and_paging(client):
    box = make_container(client, "Garage box")
    for i in range(25):
        make_item(client, f"Bolt {i}", contained_in=box["id"])
    make_item(client, "Hammer", description="big claw hammer")

    page = client.get("/api/items/", params={"limit": 10}).json()
    assert page["total"] == 26 and len(page["items"]) == 10

    found = client.get("/api/items/", params={"q": "CLAW"}).json()
    assert [i["name"] for i in found["items"]] == ["Hammer"]

    in_box = client.get("/api/items/", params={"container_id": box["id"], "limit": 100}).json()
    assert in_box["total"] == 25
    assert in_box["items"][0]["container_name"] == "Garage box"


def test_container_detail_has_items_children_and_path(client):
    shelf = make_container(client, "Shelf")
    box = make_container(client, "Box", contained_in=shelf["id"])
    bag = make_container(client, "Bag", contained_in=box["id"])
    make_item(client, "Cable", contained_in=box["id"])

    detail = client.get(f"/api/containers/{box['id']}").json()
    assert [i["name"] for i in detail["items"]] == ["Cable"]
    assert [c["name"] for c in detail["child_containers"]] == ["Bag"]
    assert detail["path"] == [{"id": shelf["id"], "name": "Shelf"}]

    # Can't put the shelf inside its own grandchild
    res = client.put(f"/api/containers/{shelf['id']}", json={"name": "Shelf", "contained_in": bag["id"]})
    assert res.status_code == 400


def test_deleting_container_moves_contents_up(client):
    shelf = make_container(client, "Shelf")
    box = make_container(client, "Box", contained_in=shelf["id"])
    item = make_item(client, "Cable", contained_in=box["id"])

    assert client.delete(f"/api/containers/{box['id']}").status_code == 200
    assert client.get(f"/api/items/{item['id']}").json()["contained_in"] == shelf["id"]


def test_deleting_room_keeps_containers(client):
    room = client.post("/api/rooms/", json={"name": "Garage", "width": 5, "length": 6, "height": 3}).json()
    box = make_container(client, "Box", room_id=room["id"], xCoor=1, yCoor=0, zCoor=2)
    assert client.get(f"/api/rooms/{room['id']}").json()["containers"][0]["xCoor"] == 1

    client.delete(f"/api/rooms/{room['id']}")
    assert client.get(f"/api/containers/{box['id']}").json()["room_id"] is None


def test_image_upload_is_served_and_cleaned_up(client):
    res = client.post(
        "/api/image/uploadImage",
        files={"file": ("photo.jpg", io.BytesIO(b"fake-jpeg-bytes"), "image/jpeg")},
    )
    assert res.status_code == 200
    path = res.json()["saved_path"]
    assert path.startswith("media/") and "\\" not in path
    assert client.get(f"/{path}").content == b"fake-jpeg-bytes"

    item = make_item(client, "Camera", image_path=path)
    client.delete(f"/api/items/{item['id']}")
    assert not os.path.exists(os.path.join(Config.mediaDir, os.path.basename(path)))


def test_upload_rejects_non_images(client):
    res = client.post(
        "/api/image/uploadImage",
        files={"file": ("notes.txt", io.BytesIO(b"hello"), "text/plain")},
    )
    assert res.status_code == 400


def test_item_quantity(client):
    item = make_item(client, "AA battery", quantity=12)
    assert item["quantity"] == 12
    res = client.put(f"/api/items/{item['id']}", json={"name": "AA battery", "quantity": -1})
    assert res.status_code == 422

from fastapi import APIRouter

router = APIRouter(prefix="/loads", tags=["loads"])

@router.post('/')
def post_load():
    return {"message": "Post a new load"}

@router.get('/')
def get_loads():
    return {"message": "Get all loads"}

@router.post('/accept')
def accept_load():
    return {"message": "Accept a load"}

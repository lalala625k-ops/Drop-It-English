"""Application-wide language choice, shared across boards and launcher ports."""
from typing import Literal
from fastapi import APIRouter
from pydantic import BaseModel
from backend.services.data_paths import get_config, update_config

router = APIRouter(prefix='/api/preferences', tags=['preferences'])


class LanguagePreference(BaseModel):
    language: Literal['en', 'zh'] = 'en'
    confirmed: bool = False


@router.get('/language')
def get_language():
    stored = get_config().get('language_preference', {})
    return {'language': stored.get('language') if stored.get('language') in ('en', 'zh') else 'en',
            'confirmed': stored.get('confirmed') is True}


@router.post('/language')
def save_language(preference: LanguagePreference):
    update_config({'language_preference': preference.model_dump()})
    return preference.model_dump()

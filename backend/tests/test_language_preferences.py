import json
import os
import tempfile
import unittest
import zipfile
from pathlib import Path
from unittest.mock import patch
from fastapi import FastAPI
from backend.routes.preferences import router
from backend.services import data_paths
from backend.services.localization import set_request_language, reset_request_language, translate, translate_payload
from backend.tests.asgi_client import ASGIClient


class LanguageTests(unittest.TestCase):
    def test_first_choice_is_shared_across_boards_and_config_updates(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            with patch.object(data_paths, 'CONFIG_DIR', root), patch.object(data_paths, 'CONFIG_FILE', root / 'config.json'):
                app = FastAPI()
                app.include_router(router)
                client = ASGIClient(app)
                self.assertEqual(client.get('/api/preferences/language').json(), {'language': 'en', 'confirmed': False})
                preference = {'language': 'zh', 'confirmed': True}
                self.assertEqual(client.post('/api/preferences/language', preference).json(), preference)
                data_paths.update_config({'unrelated_setting': 42})
                self.assertEqual(client.get('/api/preferences/language?board_id=other').json(), preference)
                self.assertEqual(data_paths.get_config()['unrelated_setting'], 42)
                self.assertEqual(client.post('/api/preferences/language', {'language': 'fr'}).status_code, 422)

    def test_native_labels_and_errors_follow_request_language_and_do_not_translate_content(self):
        token = set_request_language('en-US')
        try:
            self.assertEqual(translate('存为'), 'Save As')
            self.assertEqual(translate('无法打开存为窗口（错误码 5）'), 'Could not open Save As (error 5)')
            result = translate_payload({'detail': '请选择 .drop 工作区文件', 'content': '中文内容', 'title': '设置'})
            self.assertEqual(result, {'detail': 'Choose a .drop workspace file', 'content': '中文内容', 'title': '设置'})
        finally:
            reset_request_language(token)
        token = set_request_language('zh-CN')
        try:
            self.assertEqual(translate('存为'), '存为')
        finally:
            reset_request_language(token)

    def test_public_template_is_single_english_board_with_embedded_resources(self):
        folder = Path(__file__).resolve().parents[2] / 'desktop' / 'Template'
        self.assertEqual([item.name for item in folder.iterdir()], ['Template English.drop'])
        with zipfile.ZipFile(folder / 'Template English.drop') as archive:
            payload = archive.read('meta.json').decode()
            self.assertFalse(any('\u4e00' <= char <= '\u9fff' for char in payload))
            meta = json.loads(payload)
            self.assertEqual((len(meta['cards']), len(meta['groups']), len(meta['pins'])), (57, 8, 2))
            self.assertNotIn('vd_source', payload)
            self.assertNotIn('feishu.cn/wiki/', payload)
            for card in meta['cards']:
                image = card.get('image') or ''
                if image.startswith('/api/'):
                    self.assertIn(image.removeprefix('/api/'), archive.namelist())


if __name__ == '__main__':
    unittest.main()

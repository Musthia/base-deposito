import requests


class ApiClient:

    def __init__(self, base_url):
        self.base_url = base_url
        self.token = None
        self.refresh_token = None

    def set_tokens(self, token, refresh_token=None):
        self.token = token
        self.refresh_token = refresh_token

    def _headers(self):
        headers = {
            "Content-Type": "application/json"
        }

        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"

        return headers

    def post(self, url, data):
        response = requests.post(
            self.base_url + url,
            json=data,
            headers=self._headers()
        )

        return self._handle(response)

    def get(self, url):
        response = requests.get(
            self.base_url + url,
            headers=self._headers()
        )

        return self._handle(response)

    def _handle(self, response):
        try:
            return response.json()
        except:
            return {
                "success": False,
                "mensaje": "Respuesta inválida del servidor"
            }
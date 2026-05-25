import { defineMock } from "vite-plugin-mock-dev-server";

export default defineMock({
    url: '/api/auth/login',
    body: {
            "token": "eyJhbGciOiJIUzI1NiIsInR5c",
            "user": {
                "id": 1,
                "name": "Sara Alcantar",
                "role": "cajero"
            },
            "metadata": {
                "serverDateTime": "2026-05-23T14:00:08.000Z",
                "systemVersion": "1.0.0"
            }
          }
})
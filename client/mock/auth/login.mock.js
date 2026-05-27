import { defineMock } from "vite-plugin-mock-dev-server";

export default defineMock({
    url: '/api/auth/login',
    method: 'POST',
    body: {
        "token": "eyJhbGciOiJIUzI1NiIsInR5c",
        "usuario": {
            "id": 1,
            "nombre": "Sara Alcantar",
            "rol": "cajero"
        },
        "metadata": {
            "fecha_hora_servidor": "2026-05-23T14:00:08.000Z",
            "version_sistema": "1.0.0"
        }
    }
})
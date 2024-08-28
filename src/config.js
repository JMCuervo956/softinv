//export const port = 3000

// se debe validar si estamos recibiendo variable de Entorno en la nuebe

export const PORT = process.env.PORT || 3000

// si se tiene variable de entorno se toma PORT, sino 3000

export const DB_HOST = process.env.DB_HOST || 'localhost'
export const DB_USER = process.env.DB_USER || 'josema'
export const DB_PASSWORD = process.env.DB_PASSWORD || 'josema'
export const DB_NAME = process.env.DB_NAME || 'sarlaft'
export const DB_PORT = process.env.DB_PORT || '3306'
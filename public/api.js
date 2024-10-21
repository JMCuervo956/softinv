export async function saveTableData(data) {
    try {
        const response = await fetch('/save-table-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Error en la solicitud');
        }

        return await response.json();
    } catch (error) {
        console.error('Error al enviar los datos:', error);
        throw error;
    }
}

export async function saveTableData2(data) {
    try {
        const response = await fetch('/save-table-data2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Error en la solicitud');
        }

        return await response.json();
    } catch (error) {
        console.error('Error al enviar los datos:', error);
        throw error;
    }
}



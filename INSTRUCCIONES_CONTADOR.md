# 📊 Configuración del Contador de Visitas Global

Para que el contador funcione en todos los dispositivos (celular, computador, etc.), necesitas configurar Google Apps Script como backend gratuito.

## 🔧 Pasos para Configurar:

### 1. Crear Google Sheet
1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo
3. Nómbrala "Telares Visitas"

### 2. Configurar las Hojas
Crea 2 hojas dentro del documento:
- **Hoja 1**: Llámala "Visitas" (para visitas generales)
- **Hoja 2**: Llámala "Paginas" (para visitas por sección)

En "Visitas" pon estos encabezados en la fila 1:
```
Fecha | Hora | Timestamp
```

En "Paginas" pon estos encabezados en la fila 1:
```
Página | Fecha | Hora | Timestamp
```

### 3. Abrir Apps Script
1. En tu Google Sheet, ve a **Extensiones > Apps Script**
2. Borra el código que aparece por defecto
3. Copia y pega el siguiente código:

```javascript
function doGet(e) {
  const action = e.parameter.action;
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === 'getStats') {
    // Obtener total de visitas
    const visitasSheet = sheet.getSheetByName('Visitas');
    const totalVisits = visitasSheet.getLastRow() - 1; // -1 por el encabezado
    
    return ContentService.createTextOutput(JSON.stringify({
      totalVisits: totalVisits,
      status: 'success'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'getPageStats') {
    // Obtener visitas por página
    const paginasSheet = sheet.getSheetByName('Paginas');
    const data = paginasSheet.getDataRange().getValues();
    
    const pageStats = {};
    for (let i = 1; i < data.length; i++) { // Empezar en 1 para saltar encabezado
      const pageName = data[i][0];
      pageStats[pageName] = (pageStats[pageName] || 0) + 1;
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      pageStats: pageStats,
      status: 'success'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'error',
    message: 'Acción no válida'
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const action = e.parameter.action;
    const data = JSON.parse(e.postData.contents);
    
    if (action === 'addVisit') {
      // Agregar visita general
      const visitasSheet = sheet.getSheetByName('Visitas');
      visitasSheet.appendRow([
        data.date,
        data.time,
        data.timestamp
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Visita registrada'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'addPageVisit') {
      // Agregar visita por página
      const paginasSheet = sheet.getSheetByName('Paginas');
      paginasSheet.appendRow([
        data.page,
        data.date,
        data.time,
        data.timestamp
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Visita de página registrada'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Acción no válida'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

### 4. Implementar como Web App
1. Haz clic en **Implementar > Nueva implementación**
2. En "Tipo", selecciona **Aplicación web**
3. Configuración:
   - **Descripción**: "API Contador Visitas"
   - **Ejecutar como**: Yo (tu cuenta)
   - **Quién tiene acceso**: Cualquier persona
4. Haz clic en **Implementar**
5. **Copia la URL** que aparece (se ve como: `https://script.google.com/macros/s/XXXXXXX/exec`)

### 5. Configurar en el Sitio Web
1. Abre el archivo `js/script.js`
2. En la línea 30 aproximadamente, busca:
   ```javascript
   const VISIT_API = 'TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI';
   ```
3. Reemplaza `'TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI'` con la URL que copiaste:
   ```javascript
   const VISIT_API = 'https://script.google.com/macros/s/XXXXXXX/exec';
   ```
4. Guarda el archivo
5. Sube los cambios a GitHub

### 6. ¡Listo! 🎉
Ahora el contador funcionará globalmente:
- ✅ Cuenta visitas desde cualquier dispositivo
- ✅ Funciona en celular y computador
- ✅ Las estadísticas se ven en el panel de administración
- ✅ Los datos se guardan en tu Google Sheet

## 📱 Probar
1. Abre tu sitio desde tu celular
2. Abre tu sitio desde tu computador
3. Ve al panel de administración (contraseña: Paulina2025)
4. Verás las visitas de ambos dispositivos sumadas

## 🔍 Ver los Datos
Puedes ver todas las visitas directamente en tu Google Sheet:
- Hoja "Visitas" = visitas totales
- Hoja "Paginas" = visitas por cada sección

## ⚠️ Importante
- La URL de Google Apps Script es gratis y no caduca
- Solo tú tienes acceso al Google Sheet
- Los visitantes no pueden ver ni editar los datos
- Si cambias algo en el código del Apps Script, debes hacer una "Nueva implementación"

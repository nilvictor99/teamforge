# TeamForge

Gestor web de equipos - Importa listas de participantes y distribúyelos automáticamente en grupos.

## Características

- **100% Cliente**: Todo el procesamiento se realiza en el navegador. Los datos nunca salen del dispositivo.
- **Sin autenticación, sin backend, sin base de datos**: Privacidad total.
- **Múltiples formatos**: Soporta archivos .xlsx, .xls, .csv, .txt o pegar texto directamente.
- **Algoritmos de distribución**:
  - Aleatorio (Fisher-Yates)
  - Cronológico (orden original)
  - Cronológico inverso
- **Exportación**: Descarga resultados en PDF o Excel
- **Responsive**: Funciona en móvil, tablet y escritorio

## Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar build
npm run preview
```

## Despliegue

El proyecto está listo para desplegar en Vercel, Netlify o GitHub Pages.

### Vercel
```bash
npm i -g vercel
vercel
```

### Netlify
```bash
npm run build
# Subir carpeta dist/
```

## Stack Tecnológico

- React + TypeScript + Vite
- TailwindCSS
- SheetJS (xlsx)
- jsPDF + jsPDF-AutoTable
- file-saver
- lucide-react

## Uso

1. **Ingesta**: Sube un archivo (.xlsx, .xls, .csv, .txt) por arrastrar y soltar o pega la lista directamente.
2. **Configuración**: Elige entre dividir por número de grupos o integrantes por grupo, y selecciona el algoritmo.
3. **Generar**: Pulsa "Generar Equipos" para crear los grupos.
4. **Exportar**: Descarga los resultados en PDF o Excel.

## Notas

- Los grupos se equilibran al máximo posible si no son divisibles exactamente.
- Si hay menos participantes que grupos solicitados, el botón se deshabilita.
- Los duplicados se cuentan como participantes distintos.
- Solo se procesa la primera hoja de archivos Excel con múltiples hojas.

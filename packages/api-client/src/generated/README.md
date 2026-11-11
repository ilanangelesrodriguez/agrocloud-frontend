# Tipos OpenAPI generados

Los tipos del Gateway se generarán aquí cuando su contrato agregado esté disponible.

Ejemplo posterior a la instalación (requiere Gateway ejecutándose):

```bash
npm install -D -w @agrocloud/api-client openapi-typescript
npx openapi-typescript http://localhost:4000/openapi.json -o packages/api-client/src/generated/schema.d.ts
```

No incluir todavía un contrato ficticio. Revisar `/api/v1` y los prefijos reales antes de consumir cada operación.

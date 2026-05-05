const TURSO_API = 'https://personalpork-allantoteles.aws-us-east-1.turso.io';
const AUTH_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzc5NDgyNDcsImlkIjoiMDE5ZGY0YmUtYTQwMS03ZjIxLTk3NzYtNWYwZTNmMjI3NTgzIiwicmlkIjoiOGM0NWFjYmItN2UwOS00YjRiLTkzNjktZDYzNjk1MDJmMzY0In0.Fc9OgdlndrUsLMcpk7SToMyttEWU7g19zhZO3KiJ2dSoc9_lZIwSVHn_Onz74gf5rgyOf5xI27oJgY9H0QnTAQ';

function escapeValue(val: unknown): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? '1' : '0';
  return `'${String(val).replace(/'/g, "''")}'`;
}

function buildInlineParams(sql: string, params?: unknown[]): string {
  if (!params || params.length === 0) return sql;
  let idx = 0;
  return sql.replace(/\?/g, () => {
    const val = params[idx++];
    return escapeValue(val);
  });
}

export async function query<T>(sql: string, params?: unknown[]): Promise<T[]> {
  const inlineSql = buildInlineParams(sql, params);
  const response = await fetch(`${TURSO_API}/v2/pipeline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [{ type: 'execute', stmt: { sql: inlineSql } }]
    })
  });

  const data = await response.json();
  if (data.results?.[0]?.type === 'ok') {
    return data.results[0].response.result.rows.map((row: unknown[]) => {
      const cols = data.results[0].response.result.cols;
      const obj: Record<string, unknown> = {};
      cols.forEach((col: { name: string }, i: number) => {
        let cell: unknown = row[i];
        if (cell !== null && typeof cell === 'object') {
          if ('value' in cell) {
            cell = cell.value;
          } else if ('type' in cell) {
            cell = null;
          }
        }
        obj[col.name] = cell;
      });
      return obj as T;
    });
  }
  throw new Error(JSON.stringify(data));
}

export async function execute(sql: string, params?: unknown[]): Promise<void> {
  await query(sql, params);
}
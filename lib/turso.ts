const TURSO_API = 'https://personalpork-allantoteles.aws-us-east-1.turso.io';
const AUTH_TOKEN = 'eyJhbGciOiJFZERTQSIsInN5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzc5Mjc2NDMsImlkIjoiMDE5ZGY0YmUtYTQwMS03ZjIxLTk3NzYtNWYwZTNmMjI3NTgzIiwicmlkIjoiOGM0NWFjYmItN2UwOS00YjRiLTkzNjktZDYzNjk1MDJmMzY0In0.NgPvBSdoGC_4H8pFM7DG67v1WsXd-z2kh3B3XdqBLbcUNLVCu8BtRtwySOgJnDjcReO2fTCM-p70plLwRVe8DQ';

export async function query<T>(sql: string, params?: unknown[]): Promise<T[]> {
  const response = await fetch(`${TURSO_API}/v2/pipeline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [{ type: 'execute', stmt: { sql, params: params || [] } }]
    })
  });

  const data = await response.json();
  if (data.results?.[0]?.type === 'ok') {
    return data.results[0].response.result.rows.map(row => {
      const cols = data.results[0].response.result.cols;
      const obj: Record<string, unknown> = {};
      cols.forEach((col: { name: string }, i: number) => {
        obj[col.name] = row[i]?.value ?? row[i];
      });
      return obj as T;
    });
  }
  throw new Error(JSON.stringify(data));
}

export async function execute(sql: string, params?: unknown[]): Promise<void> {
  await query(sql, params);
}